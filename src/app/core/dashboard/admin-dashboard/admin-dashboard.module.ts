import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminDashboardRoutingModule } from './admin-dashboard-routing.module';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { ReusablesModule } from '../../../reusables/reusables.module';
import { SharedModule } from '../../../shared/shared.module';


@NgModule({
  declarations: [
    AdminDashboardComponent
  ],
  imports: [
    CommonModule,
    AdminDashboardRoutingModule,
    SharedModule,
    ReusablesModule
  ]
})
export class AdminDashboardModule { }
