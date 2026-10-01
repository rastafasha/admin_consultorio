import { Component, Input, OnInit, OnDestroy } from "@angular/core";
import { User } from "../../models/user.model";
import { AppointmentService } from "../../services/appointment.service";
import { PaymentService } from "../../services/payment.service";
import { RolesService } from "../../services/roles.service";
import { StaffService } from "../../services/staff.service";
import { Observable, Subscription } from "rxjs";
import { NotificacionService } from "../../services/notificacion.service";
import { ToastrService } from "ngx-toastr";
import { PushNotificationService } from "../../services/push-notification.service";
import { ConnectionService } from "../../services/connection.service";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-notificacionesupdate",
  templateUrl: "./notificacionesupdate.component.html",
  styleUrls: ["./notificacionesupdate.component.scss"],
  standalone: false
})
export class NotificacionesupdateComponent implements OnInit, OnDestroy {
  @Input() routes;
  @Input() user;
  @Input() usuario;
  @Input() imagenSerUrl;
  @Input() logout;

  isOnline: boolean = true;
  private networkSub!: Subscription;

  appointments: any = [];
  appointments_doctors: any = [];
  payments: any = [];
  payments_doctors: any = [];
  total: any = 0;
  totalTApp: any = 0;
  totalT: any = 0;
  totalTTr: any = 0;
  roles: any[] = [];
  userremoto: User | null = null;
  private userSubscription: any;

  public IMAGE_PREVISUALIZA = 'assets/img/user-06.jpg';
  public unreadCount$!: Observable<number>;

  public openBox: boolean = false;

  constructor(
    private appointmentService: AppointmentService,
    public paymentService: PaymentService,
    public roleService: RolesService,
    public authService: AuthService,
    public staffService: StaffService,
    public notifService: NotificacionService,
    public pushService: PushNotificationService,
    private toastr: ToastrService,
    private connectionService: ConnectionService
  ) { }

  ngOnInit(): void {
    const userString = localStorage.getItem('user');
    const userObj = userString ? JSON.parse(userString) : null;

    // Escucha activa del estado del WiFi de la clínica
    this.networkSub = this.connectionService.checkStatus().subscribe(status => {
      this.isOnline = status;
    });

    // Enlazamos el conteo del globo directamente con el BehaviorSubject del servicio
    this.unreadCount$ = this.notifService.unreadCount$;

    if (userObj && userObj.id) {
      const uid = userObj.id.toString();
      this.notifService.cargarContadorInicial(uid); 

      if (Notification.permission === 'granted') { 
        this.pushService.isSubscribed$.next(true); 
      } else {
        this.pushService.isSubscribed$.next(false); 
      }
    }

    this.userSubscription = this.authService.currentUser$.subscribe((user) => { 
      this.user = user; 
      this.roles = user?.roles ? (Array.isArray(user.roles) ? user.roles.map(r => r.name || r).flat() : [user.roles.name || user.roles]) : []; 
      if (user) { 
        this.getUserRemoto(); 
        
        // 🚀 ADOPCIÓN DE LA FUNCIÓN HUÉRFANA: La llamamos de forma proactiva una vez que el usuario está autenticado
        this.loadNotifications();
      }
    });
  }

  /**
   * Dispara el toggle de apertura y gestiona las clases del layout central
   */
  public openBoxFunc(): void {
    this.openBox = !this.openBox;
    
    const mainWrapper = document.getElementsByClassName('main-wrapper')[0];
    if (mainWrapper) {
      if (this.openBox) {
        mainWrapper.classList.add('open-msg-box');
      } else {
        mainWrapper.classList.remove('open-msg-box');
      }
    }
  }

  ngOnDestroy(): void {
    if (this.networkSub) this.networkSub.unsubscribe();
    if (this.userSubscription) this.userSubscription.unsubscribe();
  }

  onSwitchChange(event: any): void {
    const nuevoEstado = event.target.checked;
    const userString = localStorage.getItem('user');
    const userObj = userString ? JSON.parse(userString) : null;
    const userId = userObj ? userObj.id : null;

    if (!userId) {
      this.toastr.error('No se detectó un usuario activo.', 'Error');
      event.target.checked = !nuevoEstado;
      return;
    }

    this.notifService.actualizarPreferencia(userId.toString(), nuevoEstado).subscribe({
      next: () => {
        this.toastr.success('Preferencias de notificación actualizadas.');
      },
      error: (err) => {
        event.target.checked = !nuevoEstado;
        this.notifService.isSubscribed$.next(!nuevoEstado);
        this.toastr.error('Ocurrió un error en el servidor (500). Inténtalo de nuevo.', 'Error del Sistema');
        console.error('Detalle técnico del error 500:', err);
      }
    });
  }

  /**
   * 🚀 DISCRIMINACIÓN INTELIGENTE DE CARGA AUTOMÁTICA
   * Trae los datos de backend segmentando por los permisos reales del usuario
   */
  private loadNotifications(): void {
    if (!this.user?.id) return;

    setTimeout(() => {
      const userString = localStorage.getItem('user');
      const userObj = userString ? JSON.parse(userString) : null;
      
      // Verificamos si el rol en sesión es un Especialista
      const esMedico = userObj && (userObj.doctor_id || userObj.role === 'MEDICO' || userObj.role === 'DOCTOR');

      if (esMedico) {
        console.log('🩺 [LOAD] Cargando sábanas contables exclusivas del MÉDICO ID:', this.user.id);
        this.getAppointmentRecientesbyDoctor();
        this.getTrastransferenciasRecientesByDoctor();
      } else {
        console.log('🏢 [LOAD] Cargando grillas globales para PERSONAL DE RECEPCIÓN / ADMIN');
        this.getAppointmentRecientes();
        this.getTrastransferenciasRecientes();
      }
    }, 2500); // 2.5 segundos de respiro para no ahogar la carga inicial del login
  }

  getUserRemoto(): void {
    if (!this.user?.id) return;
    this.staffService.getUser(this.user.id).subscribe((resp: any) => {
      this.userremoto = resp.user;
    });
  }

  getAppointmentRecientesbyDoctor() {
    this.appointmentService.pendingsbyDoctor(this.user.id).subscribe({
      next: (response: any) => {
        this.appointments_doctors = response.appointments?.data || [];
        this.total = response.total || 0;
      },
      error: (err) => console.log('Error appointments doctor:', err)
    });
  }

  getAppointmentRecientes() {
    this.appointmentService.pendings().subscribe({
      next: (response: any) => {
        this.appointments = response.appointments?.data || [];
        this.total = response.total || 0;
        this.totalTApp = response.total || 0;
      },
      error: (err) => console.log('Error appointments globales:', err)
    });
  }

  getTrastransferenciasRecientesByDoctor() {
    this.paymentService.pendingsbyDoctor(this.user.id).subscribe({
      next: (response: any) => {
        this.payments_doctors = response.payments?.data || [];
        this.totalT = response.total || 0;
      },
      error: (err) => console.log('Error pagos doctor:', err)
    });
  }

  getTrastransferenciasRecientes() {
    this.paymentService.pendings().subscribe({
      next: (response: any) => {
        this.payments = response.payments?.data || [];
        this.totalTTr = response.total || 0;
      },
      error: (err) => console.log('Error pagos globales:', err)
    });
  }

  onLogout() { this.authService.logout(); }

  isPermission(permission: string) {
    if (this.user?.roles?.includes("SUPERADMIN")) return true;
    if (this.user?.permissions?.includes(permission)) return true;
    return false;
  }

  darkmode(dark: string) {
    const body = document.querySelector('body');
    const header = document.querySelector('header');
    const aside = document.querySelector('aside');

    if (body) body.classList.toggle('dark');
    if (header) header.classList.toggle('dark');
    if (aside) aside.classList.toggle('dark');

    Array.from(document.getElementsByClassName('globowhite')).forEach((el: Element) => {
      el.classList.toggle('globoblack');
    });

    if (body && body.classList.contains('dark')) {
      localStorage.setItem('dark', 'true');
    } else {
      localStorage.removeItem('dark');
    }
  }

  clearPayments(): void { this.payments_doctors = []; this.totalT = 0; }
  clearAppointments(): void { this.appointments_doctors = []; this.total = 0; }
  markAllAsRead(): void { this.clearPayments(); this.clearAppointments(); }

  /**
   * 🎯 NAVEGACIÓN INTELIGENTE CON DISCRIMINACIÓN DE PERMISOS
   * Consume el ruteador adaptivo del servicio para mandar a cada rol a su URL legítima
   */
    atenderNotificacion(n: any) {
    this.notifService.marcarUnaComoLeida(n._id).subscribe(() => {
      
      // 🟢 CONDICIÓN DIRECTA EN EL TS: Rápido y sin rebuscamientos
      const userString = localStorage.getItem('user');
      const userObj = userString ? JSON.parse(userString) : null;
      const esMedico = userObj && (userObj.doctor_id || userObj.role === 'DOCTOR');

      // Llamamos directo a la función del servicio que corresponda
      const ruta = esMedico 
        ? (this.notifService as any).determinarRutaMedico(n.tipo, n.referenciaId)
        : (this.notifService as any).determinarRutaAdmin(n.tipo, n.referenciaId);

      this.notifService.router.navigate([ruta]);
    });
  }

}
