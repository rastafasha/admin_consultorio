import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

const BackendApi = environment.backend_node;

export interface Notificacion {
  _id: string;
  usuario: string;
  titulo: string;
  mensaje: string;
  tipo: string;
  leido: boolean;
  referenciaId?: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private http = inject(HttpClient);
  public toastr = inject(ToastrService);
  public router = inject(Router);
  // Este observable le dirá a cualquier componente si el usuario está suscrito
  public isSubscribed$ = new BehaviorSubject<boolean>(false);
  public isProcessing$ = new BehaviorSubject<boolean>(false);

  // Estado reactivo para el contador de no leídas
  private unreadCountSub = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSub.asObservable();

  // Helper privado para no repetir los headers del token en cada método
  private getOptions() {
    return {
      headers: { 'x-token': localStorage.getItem('token') || '' }
    };
  }

  /**
    * 1. Carga el número de pendientes y actualiza el stream reactivo
    */
  cargarContador(): void {
    this.http.get<{ ok: boolean; count: number }>(
      `${BackendApi}/notificaciones/unread-count`,
      this.getOptions()
    ).subscribe({
      next: (res) => this.unreadCountSub.next(res.count),
      error: () => this.unreadCountSub.next(0)
    });
  }

  /**
    * 2. Consulta el historial e itera para renderizar alertas de Toastr exclusivas para el Admin
    */
  checkUnreadNotifications() {
    this.http.get<{ ok: boolean, notificaciones: Notificacion[] }>(
      `${BackendApi}/notificaciones/historial?page=1`,
      this.getOptions()
    ).subscribe(res => {
      if (res.ok && res.notificaciones && res.notificaciones.length > 0) {

        const noLeidas = res.notificaciones.filter(n => !n.leido);
        this.unreadCountSub.next(noLeidas.length);

        noLeidas.forEach(notif => {
          let toast;
          const config = { timeOut: 10000, closeButton: true, tapToDismiss: true };

          // 🟢 ADAPTADO PARA LOS ENUMS DEL ADMINISTRADOR
          switch (notif.tipo) {
            case 'NUEVO_PAGO':
              toast = this.toastr.info(notif.mensaje, '💰 Nuevo Pago Reportado', config);
              break;
            case 'NUEVO_PEDIDO':
              toast = this.toastr.warning(notif.mensaje, '🍕 Comanda Entrante', config);
              break;
            case 'NUEVA_RESERVACION':
              toast = this.toastr.info(notif.mensaje, '🗓️ Solicitud de Reserva', config);
              break;
            case 'PAGO_APROBADO':
              toast = this.toastr.success(notif.mensaje, '✅ Pago Verificado', config);
              break;
            case 'PAGO_RECHAZADO':
              toast = this.toastr.error(notif.mensaje, '❌ Pago Rechazado', config);
              break;
            case 'PEDIDO_APROBADO':
              toast = this.toastr.success(notif.mensaje, '✅ Pedido en Cocina', config);
              break;
            case 'PEDIDO_RECHAZADO':
              toast = this.toastr.error(notif.mensaje, '❌ Pedido Cancelado', config);
              break;
            case 'PEDIDO_FINALIZADO':
              toast = this.toastr.success(notif.mensaje, '🏁 Pedido Despachado', config);
              break;
            case 'CITA_AGENDADA':
              toast = this.toastr.success(notif.mensaje, '✅ Reserva Confirmada', config);
              break;
            case 'LLAMADO_MEDICO':
              toast = this.toastr.error(notif.mensaje, '❌ Reserva Cancelada', config);
              break;
            case 'RECORDATORIO':
              toast = this.toastr.info(notif.mensaje, '✨ Reserva Finalizada', config);
              break;
            default:
              toast = this.toastr.info(notif.mensaje, '🔔 Alerta de Sistema', config);
          }

          toast.onTap.subscribe(() => {
            this.marcarUnaComoLeida(notif._id).subscribe(() => {
              this.router.navigate([this.determinarRutaAdmin(notif.tipo, notif.referenciaId)]);
            });
          });
        });
      }
    });
  }

  /**
   * 3. Marcar TODAS como leídas
   */
  marcarComoLeidas(): Observable<any> {
    return this.http.put(`${BackendApi}/notificaciones/marcar-leidas`, {}, this.getOptions()).pipe(
      tap(() => this.unreadCountSub.next(0))
    );
  }

  /**
   * 4. Marcar UNA sola como leída
   */
  marcarUnaComoLeida(id: string): Observable<any> {
    return this.http.put(`${BackendApi}/notificaciones/${id}`, {}, this.getOptions()).pipe(
      tap(() => {
        const actual = this.unreadCountSub.value;
        if (actual > 0) this.unreadCountSub.next(actual - 1);
      })
    );
  }

  /**
   * 🟢 NUEVO: Eliminar una sola notificación por su ID en el panel del admin
   */
  borrarNotificacion(id: string): Observable<any> {
    return this.http.delete(`${BackendApi}/notificaciones/por_id/${id}`, this.getOptions()).pipe(
      tap(() => this.cargarContador()) // Recarga el número actual tras la eliminación
    );
  }

  /**
   * 🟢 NUEVO: Vaciar completamente el buzón de notificaciones del admin
   */
  limpiarBuzonCompleto(): Observable<any> {
    return this.http.delete(`${BackendApi}/notificaciones/limpiar/todas`, this.getOptions()).pipe(
      tap(() => this.unreadCountSub.next(0)) // Resetea inmediatamente en la UI
    );
  }

  /**
   * 5. Obtener historial completo paginado
   */
  obtenerHistorialCompleto(page: number = 1): Observable<{ ok: boolean, notificaciones: Notificacion[], proximo: number | null }> {
    return this.http.get<{ ok: boolean, notificaciones: Notificacion[], proximo: number | null }>(
      `${BackendApi}/notificaciones/historial?page=${page}`,
      this.getOptions()
    );
  }

  /**
   * 🟢 REFACTORIZADO: Enrutador exclusivo para las vistas del panel de administración
   */
  private determinarRutaAdmin(tipo: string, refId?: string): string {
    if (!refId) return '/dashboard';
    
    if (tipo === 'NUEVO_PAGO' || tipo.startsWith('PAGO_')) {
      return `/dashboard/transferencias`; // Ajusta si tu ruta de pagos es diferente (ej: dashboard/ventas)
    }
    if (tipo === 'NUEVO_PEDIDO' || tipo.startsWith('PEDIDO_')) {
      return `/dashboard/tienda/pedidos`; // O la ruta exacta donde gestiones las comandas
    }
    if (tipo === 'NUEVA_RESERVACION' || tipo.startsWith('RESERVACION_')) {
      return `/dashboard/reservaciones`; // 🟢 Coincide exactamente con tu ruta
    }
    
    return '/dashboard';
  }
}
