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
import { ListAppoimentCobrarComponent } from './list-appoiment-cobrar/list-appoiment-cobrar.component';
import { ListDoctorComponent } from './list-doctor/list-doctor.component';


@NgModule({
  declarations: [
    AppointmentPayComponent,
    ListAppoimentPayComponent,
    ListAppoimentCobrosComponent,
    ListAppoimentCobrarComponent,
    ListDoctorComponent
  ],
  exports: [
    AppointmentPayComponent,
    ListAppoimentPayComponent,
    ListAppoimentCobrosComponent,
    ListAppoimentCobrarComponent
  ],
  imports: [
    CommonModule,
    AppointmentPayRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    SharedModule
  ]
})
export class AppointmentPayModule { }
