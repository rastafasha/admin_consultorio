import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppointmentComponent } from './appointment.component';
import { ListAppointmentsComponent } from './list-appointments/list-appointments.component';
import { AtencionMedicaComponent } from './atencion-medica/atencion-medica.component';
import { ListDocComponent } from './list-doc/list-doc.component';
import { AtenderComponent } from './atender/atender.component';
import { AppointmentFormComponent } from './appointment-form/appointment-form.component';

const routes: Routes = [
  {path:'', component:AppointmentComponent,
  children:[
    {
      path:'add', component:AppointmentFormComponent
    },
    {
      path:'list', component:ListAppointmentsComponent
    },
    {
      path:'list/doctor/:doctor_id', component:ListDocComponent
    },
    {
      path:'list/edit/:id', component:AppointmentFormComponent
    },
    {
      path:'cita-medica/:id', component:AtencionMedicaComponent
    },
    {
      path:'atender/:id', component:AtenderComponent
    },
    {
      path:'atender/local/', component:AtenderComponent
    },
    
  ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppointmentRoutingModule { }
