import { Component, Input, OnInit } from "@angular/core";
import { AppoitmentPayService } from "src/app/medical/appointment-pay/service/appoitment-pay.service";
import { PaymentService } from "src/app/medical/appointment-pay/service/payment.service";
import { AppointmentService } from "src/app/medical/appointment/service/appointment.service";

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
  payments: any = [];
  total: any = 0;
  totalT: any = 0;
  constructor(
    private appointmentService: AppointmentService,
    public paymentService: PaymentService,
  ) {}
  ngOnInit(): void {
   setTimeout(() => {
    this.getAppointmentRecientes();
    this.getTrastransferenciasRecientes();
   }
   , 3000);
  }
  //obtiene las citas pendientes por atender
  getAppointmentRecientes() {
    this.appointmentService.pendings().subscribe(
      (response:any) => {
        // console.log(response);
        //filtramos los mas recientes
        this.appointments = response.appointments.data;
        this.total = response.total;
        console.log(this.appointments);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  isPermission(permission:string){
    if(this.user.roles.includes('SUPERADMIN')){
      return true;
    }
    if(this.user.permissions.includes(permission)){
      return true;
    }
    return false;
  }
  
//obtiene las transferencias pendientes por atender
  getTrastransferenciasRecientes() {
    this.paymentService.pendings().subscribe(
        (response:any) => {
          this.payments = response.payments.data;
          this.totalT = response.total;
          console.log(this.payments);
            },
            (error) => {
                console.log(error);
            }
        );  
        }
}
