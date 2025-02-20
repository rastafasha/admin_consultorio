import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppointmentRoutingModule } from './appointment-routing.module';
import { AppointmentComponent } from './appointment.component';
import { AddAppointmentsComponent } from './add-appointments/add-appointments.component';
import { EditAppointmentsComponent } from './edit-appointments/edit-appointments.component';
import { ListAppointmentsComponent } from './list-appointments/list-appointments.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { AtencionMedicaComponent } from './atencion-medica/atencion-medica.component';
import { ListDocComponent } from './list-doc/list-doc.component';
import { AtenderComponent } from './atender/atender.component';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { ReusablesModule } from 'src/app/reusables/reusables.module';


@NgModule({
  declarations: [
    AppointmentComponent,
    AddAppointmentsComponent,
    EditAppointmentsComponent,
    ListAppointmentsComponent,
    AtencionMedicaComponent,
    ListDocComponent,
    AtenderComponent
  ],
  exports: [
    AppointmentComponent,
    AddAppointmentsComponent,
    EditAppointmentsComponent,
    ListAppointmentsComponent,
    AtencionMedicaComponent,
    AtenderComponent
  ],
  imports: [
    CommonModule,
    AppointmentRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    SharedModule,
    PipesModule,
    ReusablesModule
  ]
})
export class AppointmentModule { }
