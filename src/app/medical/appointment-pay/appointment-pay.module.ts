import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppointmentPayRoutingModule } from './appointment-pay-routing.module';
import { AppointmentPayComponent } from './appointment-pay.component';
import { ListAppoimentPayComponent } from './list-appoiment-pay/list-appoiment-pay.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { ListAppoimentCobrosComponent } from './list-appoiment-cobros/list-appoiment-cobros.component';
import { ListDoctorComponent } from './list-doctor/list-doctor.component';
import { ListCobrosDoctorComponent } from './list-cobros-doctor/list-cobros-doctor.component';
import { ReusablesModule } from 'src/app/reusables/reusables.module';


@NgModule({
  declarations: [
    AppointmentPayComponent,
    ListAppoimentPayComponent,
    ListAppoimentCobrosComponent,
    ListDoctorComponent,
    ListCobrosDoctorComponent
  ],
  exports: [
    AppointmentPayComponent,
    ListAppoimentPayComponent,
    ListAppoimentCobrosComponent,
  ],
  imports: [
    CommonModule,
    AppointmentPayRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    SharedModule,
    ReusablesModule
  ]
})
export class AppointmentPayModule { }
