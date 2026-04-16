import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { ModalInstruccionesModule } from '../../modales/modal-instrucciones.module';
import { ReusablesModule } from '../../reusables/reusables.module';


@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    ModalInstruccionesModule,
    ReusablesModule
  ]
})
export class DashboardModule { }
