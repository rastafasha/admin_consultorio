import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { ReusablesModule } from '../../reusables/reusables.module';
import { ModalInstruccionesModule } from '../../modales/modal-instrucciones.module';


@NgModule({
  declarations: [
    DashboardComponent,
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    ReusablesModule,
  ]
})
export class DashboardModule { }
