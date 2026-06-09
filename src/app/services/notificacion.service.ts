import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { io, Socket } from 'socket.io-client';

const BackendApi = environment.backend_node;

export interface Notificacion {
  _id: string;
  usuario: string;
  rolDestinatario: 'DOCTOR' | 'GUEST';
  titulo: string;
  mensaje: string;
  leido: boolean;
  tipo: string;
  referenciaId?: string;
  fecha: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  // 1. El flujo de datos reactivo que escucharán todas las campanas de la app
  private unreadCountSub = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSub.asObservable();

  // Memoria en tiempo real para las alertas del listado del header
  public listaNotificaciones: Notificacion[] = [];

  private socket!: Socket;

  constructor() {
    // 🔥 Al arrancar el servicio de forma global, se conectan los cables del WebSocket de una vez
    this.inicializarEcosistemaAlertas();
  }

  get currentRole(): 'DOCTOR' | 'GUEST' {
    const userString = localStorage.getItem('user');
    const userObj = userString ? JSON.parse(userString) : null;
    // Retorna 'MEDICO' si tiene la propiedad de doctor o rol médico, si no, 'GUEST'
    return userObj && (userObj.doctor_id || userObj.role === 'DOCTOR') ? 'DOCTOR' : 'GUEST';
  }

  private getOptions() {
    return { headers: { 'x-token': localStorage.getItem('token') || '' } };
  }

  /**
   * 🔥 EL MOTOR CENTRAL: Conecta el socket y se queda escuchando de forma pasiva por detrás
   */
  inicializarEcosistemaAlertas() {
    const token = localStorage.getItem('token') || '';
    if (!token) return; // Si no hay token (pantalla de login), salimos pacíficamente

    // Si ya existe una conexión previa activa, la desconectamos para evitar duplicados
    if (this.socket) {
      this.socket.disconnect();
    }
    this.socket = io(BackendApi, {
      autoConnect: true,
      extraHeaders: { 'x-token': token }
    });
    this.socket.on('connect', () => {
      console.log(`⚡ Sockets centralizados de Klyntic listos para el rol: ${this.currentRole}`);

      // Metemos al usuario logueado en su sala privada de forma automática
      const userString = localStorage.getItem('user');
      const userObj = userString ? JSON.parse(userString) : null;
      if (userObj && userObj.id) {
        this.socket.emit('join-room', userObj.id.toString());
      }
    });

    // 1. Escucha pasiva del socket dentro del constructor del servicio centralizado
    this.socket.on('recibir-alerta', (nuevaNotif: Notificacion) => {
      console.log('🔔 Capturada por WebSocket:', nuevaNotif);

      // Alimentamos la lista del header sin hacer peticiones HTTP extras
      this.listaNotificaciones.unshift(nuevaNotif);

      // Actualizamos el contador de la campana sumando 1 de una vez
      const actual = this.unreadCountSub.value;
      this.unreadCountSub.next(actual + 1);

      // 🔥 LA LLAMADA LIMPIA: Lanzamos el Toastr directo usando el objeto que viajó por el cable
      this.lanzarToastrEnPantalla(nuevaNotif);
    });
  }

  /**
   * Consulta inicial rápida por HTTP para saber el conteo del pasado
   */
  cargarContadorInicial(usuarioId: string): void {
    this.http.get<{ ok: boolean, notificaciones: Notificacion[] }>(
      `${BackendApi}/klyntic/notificaciones/usuario/${usuarioId}?page=1`,
      this.getOptions()
    ).subscribe({
      next: (res) => {
        if (res.ok) {
          this.listaNotificaciones = res.notificaciones;
          const sinLeer = this.listaNotificaciones.filter(n => !n.leido).length;
          // Inicializamos la burbuja roja con las alertas viejas sin leer
          this.unreadCountSub.next(sinLeer);
        }
      }
    });
  }

  /**
   * El switch de Toastrs que procesa los Enums médicos
   */
  private lanzarToastrEnPantalla(notif: Notificacion) {
    let toast;
    const config = { timeOut: 10000, closeButton: true, tapToDismiss: true };
    const esMedico = this.currentRole === 'DOCTOR';

    switch (notif.tipo) {
      case 'PAGO_RECIBIDO':
        toast = this.toastr.success(
          notif.mensaje,
          esMedico ? '💰 Pago Reportado por Paciente' : '✅ Tu Pago ha sido Recibido',
          config
        );
        break;


      case 'PRESUPUESTO_APROBADO':
        toast = this.toastr.success(notif.mensaje, '🎉 ¡Presupuesto Aprobado por Paciente!', config);
        break;

      case 'CONSULTA_NUEVA':
        toast = this.toastr.info(notif.mensaje, '🩺 Nueva Consulta Iniciada', config);
        break;

      case 'LLAMADO_MEDICO':
        toast = this.toastr.warning(notif.mensaje, '🚨 Llamado Urgente / Alerta', config);
        break;
      case 'RECORDATORIO':
        toast = this.toastr.info(notif.mensaje, '⏰ Recordatorio Próxima Cita', config);
        break;
      default:
        toast = this.toastr.info(notif.mensaje, '🔔 Alerta de Sistema', config);
    }

    toast.onTap.subscribe(() => {
      this.marcarUnaComoLeida(notif._id).subscribe(() => {
        const ruta = esMedico ? this.determinarRutaMedico(notif.tipo, notif.referenciaId) : this.determinarRutaPaciente(notif.tipo, notif.referenciaId);
        this.router.navigate([ruta]);
      });
    });
  }

  marcarComoLeidas(): Observable<any> {
    return this.http.put(`${BackendApi}/klyntic/notificaciones/marcar-leidas`, {}, this.getOptions()).pipe(
      tap(() => this.unreadCountSub.next(0))
    );
  }

  marcarUnaComoLeida(id: string): Observable<any> {
    return this.http.put(`${BackendApi}/klyntic/notificaciones/${id}`, {}, this.getOptions()).pipe(
      tap(() => {
        const actual = this.unreadCountSub.value;
        if (actual > 0) this.unreadCountSub.next(actual - 1);
      })
    );
  }

  obtenerHistorialCompleto(page: number = 1): Observable<any> {
    const userString = localStorage.getItem('user');
    const userObj = userString ? JSON.parse(userString) : null;
    const usuarioId = userObj ? userObj.id : '';

    return this.http.get(`${BackendApi}/klyntic/notificaciones/usuario/${usuarioId}?page=${page}`, this.getOptions());
  }

  private determinarRutaMedico(tipo: string, refId?: string): string {
    if (!refId) return '/dashboard';
    if (tipo.startsWith('PAGO_')) return `/dashboard/administracion/pagos/${refId}`;
    if (tipo.startsWith('PRESUPUESTO_')) return `/dashboard/pacientes/presupuesto/${refId}`;
    if (tipo === 'CONSULTA_NUEVA' || tipo === 'RECORDATORIO') return `/dashboard/agenda`;
    return '/dashboard';
  }

  private determinarRutaPaciente(tipo: string, refId?: string): string {
    if (!refId) return '/app/home';
    if (tipo.startsWith('PAGO_')) return `/app/mis-pagos`;
    if (tipo === 'PRESUPUESTO_NUEVO') return `/app/mis-presupuestos`;
    if (tipo === 'RECORDATORIO') return `/app/home`;
    return '/app/home';
  }





  // borrarNotificacion(id: string): Observable<any> {
  //   return this.http.delete(`${BackendApi}/klyntic/notificaciones/por_id/${id}`, this.getOptions()).pipe(
  //     tap(() => this.cargarContador())
  //   );
  // }

  limpiarBuzonCompleto(): Observable<any> {
    return this.http.delete(`${BackendApi}/klyntic/notificaciones/limpiar/todas`, this.getOptions()).pipe(
      tap(() => this.unreadCountSub.next(0))
    );
  }






}
