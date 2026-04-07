import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DoctorDashboardRoutingModule } from './doctor-dashboard-routing.module';
import { DoctorDashboardComponent } from './doctor-dashboard.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ModalInstruccionesModule } from 'src/app/modales/modal-instrucciones.module';
import { ReusablesModule } from 'src/app/reusables/reusables.module';


@NgModule({
  declarations: [
    DoctorDashboardComponent
  ],
  imports: [
    CommonModule,
    DoctorDashboardRoutingModule,
    SharedModule,
    ModalInstruccionesModule,
    ReusablesModule
  ]
})
export class DoctorDashboardModule { }
