import { Component, Input, OnInit } from "@angular/core";
import { AppoitmentPayService } from "src/app/medical/appointment-pay/service/appoitment-pay.service";
import { PaymentService } from "src/app/medical/appointment-pay/service/payment.service";
import { AppointmentService } from "src/app/medical/appointment/service/appointment.service";
import { RolesService } from "src/app/medical/roles/service/roles.service";
import { AuthService } from "src/app/shared/auth/auth.service";

@Component({
  selector: "app-notificacionesupdate",
  templateUrl: "./notificacionesupdate.component.html",
  styleUrls: ["./notificacionesupdate.component.scss"],
})
export class NotificacionesupdateComponent implements OnInit {
  @Input() routes;
  @Input() darkMode;
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
  roles: any = [];
  constructor(
    private appointmentService: AppointmentService,
    public paymentService: PaymentService,
    public roleService: RolesService,
    public authService: AuthService,
  ) {}
  ngOnInit(): void {
    this.user = this.roleService.authService.user;
    this.roles = this.user.roles[0];
    setTimeout(() => {
      this.getAppointmentRecientes();
      this.getAppointmentRecientesbyDoctor();
      this.getTrastransferenciasRecientesByDoctor();
      this.getTrastransferenciasRecientes();
    }, 3000);
    
    


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
        console.log(this.payments_doctors);
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
        console.log(this.payments);
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
}
