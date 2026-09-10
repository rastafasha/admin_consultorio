import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { io, Socket } from 'socket.io-client';

const BackendApi = environment.backend_node;
const SocketUrl = environment.socket_url; 

export interface Notificacion {
  _id: string;
  usuario: string;
  rolDestinatario: 'DOCTOR' ;
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

  // ESTADOS REACTIVOS NUEVOS: Controlan la UI del switch de forma segura
  public isSubscribed$ = new BehaviorSubject<boolean>(false);
  public isProcessing$ = new BehaviorSubject<boolean>(false);

  private unreadCountSub = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSub.asObservable();

  public listaNotificaciones: Notificacion[] = [];
  private socket!: Socket;

  constructor() {
    this.inicializarEcosistemaAlertas();
  }

  get currentRole(): 'DOCTOR'  {
    const userString = localStorage.getItem('user');
    const userObj = userString ? JSON.parse(userString) : null;
    return userObj && (userObj.doctor_id || userObj.roles === 'DOCTOR');
  }

  private getOptions() {
    return { headers: { 'x-token': localStorage.getItem('token') || '' } };
  }

  // NUEVO: Consulta las preferencias reales guardadas en la BD (Evita que el switch mienta)
  verificarPreferenciaServidor(usuarioId: string): void {
    this.isProcessing$.next(true);
    this.http.get<{ ok: boolean, activo: boolean }>(
      `${BackendApi}/klyntic/notificaciones/preferencia/${usuarioId}`,
      this.getOptions()
    ).subscribe({
      next: (res) => {
        if (res.ok) {
          this.isSubscribed$.next(res.activo);
        }
        this.isProcessing$.next(false);
      },
      error: () => {
        // Si da error o "no tiene registro", el switch se queda apagado de forma segura
        this.isSubscribed$.next(false);
        this.isProcessing$.next(false);
      }
    });
  }

  // NUEVO: Actualiza el switch en Node.js y maneja el estado de carga
  actualizarPreferencia(usuarioId: string, activado: boolean): Observable<{ ok: boolean }> {
    this.isProcessing$.next(true);
    return this.http.put<{ ok: boolean }>(
      `${BackendApi}/klyntic/notificaciones/configurar`,
      { usuarioId, activado },
      this.getOptions()
    ).pipe(
      tap({
        next: () => {
          this.isSubscribed$.next(activado);
          this.isProcessing$.next(false);
        },
        error: () => {
          this.isProcessing$.next(false);
        }
      })
    );
  }

  inicializarEcosistemaAlertas() {
    const token = localStorage.getItem('token') || '';
    if (!token) return; 

    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io(SocketUrl, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
      extraHeaders: { 'x-token': token }
    });

    this.socket.on('connect', () => {
      console.log(`⚡ Sockets centralizados de Klyntic listos para el rol: ${this.currentRole}`);
      const userString = localStorage.getItem('user');
      const userObj = userString ? JSON.parse(userString) : null;
      if (userObj && userObj.id) {
        this.socket.emit('join-room', userObj.id.toString());
      }
    });

    this.socket.on('recibir-alerta', (nuevaNotif: Notificacion) => {
      console.log('🔔 Capturada por WebSocket:', nuevaNotif);
      this.listaNotificaciones.unshift(nuevaNotif);
      const actual = this.unreadCountSub.value;
      this.unreadCountSub.next(actual + 1);
      this.lanzarToastrEnPantalla(nuevaNotif);
    });
  }

  cargarContadorInicial(usuarioId: string): void {
    this.http.get<{ ok: boolean, notificaciones: Notificacion[] }>(
      `${BackendApi}/klyntic/notificaciones/usuario/${usuarioId}?page=1`,
      this.getOptions()
    ).subscribe({
      next: (res) => {
        if (res.ok && res.notificaciones) {
          this.listaNotificaciones = res.notificaciones;
          const sinLeer = this.listaNotificaciones.filter(n => !n.leido).length;
          this.unreadCountSub.next(sinLeer);
        }
      },
      error: () => this.unreadCountSub.next(0)
    });
  }

  private lanzarToastrEnPantalla(notif: Notificacion) {
    let toast;
    const config = { timeOut: 10000, closeButton: true, tapToDismiss: true };
    const esMedico = this.currentRole === 'DOCTOR';

    switch (notif.tipo) {
      case 'PAGO_RECIBIDO':
        toast = this.toastr.success(notif.mensaje, esMedico ? '💰 Pago Reportado por Paciente' : '✅ Tu Pago ha sido Recibido', config);
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

  limpiarBuzonCompleto(): Observable<any> {
    return this.http.delete(`${BackendApi}/klyntic/notificaciones/limpiar/todas`, this.getOptions()).pipe(
      tap(() => this.unreadCountSub.next(0))
    );
  }
}
