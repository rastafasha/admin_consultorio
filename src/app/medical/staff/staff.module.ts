import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StaffRoutingModule } from './staff-routing.module';
import { StaffComponent } from './staff.component';
import { ListStaffNComponent } from './list-staff-n/list-staff-n.component';
import { StaffNComponent } from './staff-n/staff-n.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FileSaverModule } from 'ngx-filesaver';
import { CoreModule } from '../../core/core.module';
import { PipesModule } from '../../pipes/pipes.module';
import { ReusablesModule } from '../../reusables/reusables.module';
import { SharedModule } from '../../shared/shared.module';


@NgModule({ declarations: [
        StaffComponent,
        ListStaffNComponent,
        StaffNComponent
    ],
    exports: [
        StaffComponent,
        ListStaffNComponent,
        StaffNComponent
    ], imports: [CommonModule,
        StaffRoutingModule,
        CoreModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        SharedModule,
        FileSaverModule,
        ReusablesModule,
        PipesModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class StaffModule { }
