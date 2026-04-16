import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DoctorDashboardRoutingModule } from './doctor-dashboard-routing.module';
import { DoctorDashboardComponent } from './doctor-dashboard.component';
import { ModalInstruccionesModule } from '../../../modales/modal-instrucciones.module';
import { ReusablesModule } from '../../../reusables/reusables.module';
import { SharedModule } from '../../../shared/shared.module';


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
