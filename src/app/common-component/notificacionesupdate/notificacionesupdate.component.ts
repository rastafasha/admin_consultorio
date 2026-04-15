import { Component, Input, OnInit, OnDestroy } from "@angular/core";
import { User } from "src/app/models/user.model";
import { PaymentService } from "src/app/services/payment.service";
import { AppointmentService } from "src/app/services/appointment.service";
import { RolesService } from "src/app/services/roles.service";
import { AuthService } from "src/app/shared/auth/auth.service";
import { StaffService } from "src/app/services/staff.service";

@Component({
    selector: "app-notificacionesupdate",
    templateUrl: "./notificacionesupdate.component.html",
    styleUrls: ["./notificacionesupdate.component.scss"],
    standalone: false
})
export class NotificacionesupdateComponent implements OnInit {
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

  constructor(
    private appointmentService: AppointmentService,
    public paymentService: PaymentService,
    public roleService: RolesService,
    public authService: AuthService,
    public staffService: StaffService,
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe((user) => {
      this.user = user;
      this.roles = user?.roles ? (Array.isArray(user.roles) ? user.roles.map(r => r.name || r).flat() : [user.roles.name || user.roles]) : [];
      if (user) {
        this.getUserRemoto();
        this.loadNotifications();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
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
  //obtiene las citas pendientes por atender
  getAppointmentRecientesbyDoctor() {
    this.appointmentService.pendingsbyDoctor(this.user.id).subscribe(
      (response: any) => {
        // console.log(response);
        //filtramos los mas recientes
        this.appointments_doctors = response.appointments.data;
        this.total = response.total;
        // console.log(this.appointments_doctors);
      },
      (error) => {
        console.log(error);
      }
    );
  }
  getAppointmentRecientes() {
    this.appointmentService.pendings().subscribe(
      (response: any) => {
        // console.log(response);
        //filtramos los mas recientes
        this.appointments = response.appointments.data;
        this.total = response.total;
        this.totalTApp = response.total;
        // console.log(this.appointments);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  //obtiene las transferencias pendientes por atender
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

    // Toggle dark class on elements if they exist
    if (body) body.classList.toggle('dark');
    if (header) header.classList.toggle('dark');
    if (aside) aside.classList.toggle('dark');

    // Toggle globoblack class on all globowhite elements safely
    Array.from(document.getElementsByClassName('globowhite')).forEach((el: Element) => {
      el.classList.toggle('globoblack');
    });

    // Update localStorage based on body state (more reliable)
    if (body && body.classList.contains('dark')) {
      localStorage.setItem('dark', 'true');
    } else {
      localStorage.removeItem('dark');
    }
  }
}
