import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StaffRoutingModule } from './staff-routing.module';
import { StaffComponent } from './staff.component';
import { ListStaffNComponent } from './list-staff-n/list-staff-n.component';
import { StaffNComponent } from './staff-n/staff-n.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CoreModule } from 'src/app/core/core.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { FileSaverModule } from 'ngx-filesaver';
import { ReusablesModule } from 'src/app/reusables/reusables.module';
import { PipesModule } from 'src/app/pipes/pipes.module';


@NgModule({
  declarations: [
    StaffComponent,
    ListStaffNComponent,
    StaffNComponent
  ],
  exports: [
    StaffComponent,
    ListStaffNComponent,
    StaffNComponent
  ],
  imports: [
    CommonModule,
    StaffRoutingModule,
    CoreModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    SharedModule,
    FileSaverModule,
    ReusablesModule,
    PipesModule
  ]
})
export class StaffModule { }
