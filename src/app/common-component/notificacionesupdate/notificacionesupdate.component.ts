import { Component, Input, OnInit, OnDestroy } from "@angular/core";
import { User } from "../../models/user.model";
import { AppointmentService } from "../../services/appointment.service";
import { PaymentService } from "../../services/payment.service";
import { RolesService } from "../../services/roles.service";
import { StaffService } from "../../services/staff.service";
import { AuthService } from "../../shared/auth/auth.service";
import { Observable } from "rxjs";
import { NotificacionService } from "../../services/notificacion.service";
import { ToastrService } from "ngx-toastr";
import { PushNotificationService } from "../../services/push-notification.service";

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

  constructor(
    private appointmentService: AppointmentService,
    public paymentService: PaymentService,
    public roleService: RolesService,
    public authService: AuthService,
    public staffService: StaffService,
    public notifService: NotificacionService,
    public pushService: PushNotificationService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
  const userString = localStorage.getItem('user');
  const userObj = userString ? JSON.parse(userString) : null;
  
  if (userObj && userObj.id) {
    const uid = userObj.id.toString();
    // 🔔 Llama a la ruta liberada en Node para cargar la campana sin dar 401
    this.notifService.cargarContadorInicial(uid);
    
    // 🌐 Sincronización nativa pura del switch basada en el navegador:
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
    }
  });
}


  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  /**
   * 🔥 NUEVO: Esta función controla el comportamiento del switch en tu HTML
   */
  onSwitchChange(event: any): void {
    const nuevoEstado = event.target.checked;
    
    // Validamos que tengamos el ID del usuario antes de enviar la petición
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
        // 🛑 CONTROL DE ERROR 500: Si el servidor falla, el interruptor vuelve a su estado anterior en la UI
        event.target.checked = !nuevoEstado;
        this.notifService.isSubscribed$.next(!nuevoEstado);
        
        this.toastr.error('Ocurrió un error en el servidor (500). Inténtalo de nuevo.', 'Error del Sistema');
        console.error('Detalle técnico del error 500:', err);
      }
    });
  }

  private loadNotifications(): void {
    setTimeout(() => {
      this.getAppointmentRecientes();
      this.getAppointmentRecientesbyDoctor();
      this.getTrastransferenciasRecientesByDoctor();
      this.getTrastransferenciasRecientes();
    }, 3000);
  }

  getUserRemoto(): void {
    if (!this.user?.id) return;
    this.staffService.getUser(this.user.id).subscribe((resp: any) => {
      this.userremoto = resp.user;
    });
  }

  getAppointmentRecientesbyDoctor() {
    this.appointmentService.pendingsbyDoctor(this.user.id).subscribe(
      (response: any) => {
        this.appointments_doctors = response.appointments.data;
        this.total = response.total;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  getAppointmentRecientes() {
    this.appointmentService.pendings().subscribe(
      (response: any) => {
        this.appointments = response.appointments.data;
        this.total = response.total;
        this.totalTApp = response.total;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  getTrastransferenciasRecientesByDoctor() {
    this.paymentService.pendingsbyDoctor(this.user.id).subscribe(
      (response: any) => {
        this.payments_doctors = response.payments.data;
        this.totalT = response.total;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  getTrastransferenciasRecientes() {
    this.paymentService.pendings().subscribe(
      (response: any) => {
        this.payments = response.payments.data;
        this.totalTTr = response.total;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  onLogout() {
    this.authService.logout();
  }

  isPermission(permission: string) {
    if (this.user.roles.includes("SUPERADMIN")) {
      return true;
    }
    if (this.user.permissions.includes(permission)) {
      return true;
    }
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

  clearPayments(): void {
    this.payments_doctors = [];
    this.totalT = 0;
  }

  clearAppointments(): void {
    this.appointments_doctors = [];
    this.total = 0;
  }

  markAllAsRead(): void {
    this.clearPayments();
    this.clearAppointments();
  }
}
