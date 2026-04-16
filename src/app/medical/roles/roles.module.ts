import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RolesRoutingModule } from './roles-routing.module';
import { RolesComponent } from './roles.component';
import { ListRoleUserComponent } from './list-role-user/list-role-user.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { RoleFormComponent } from './role-form/role-form.component';
import { CoreModule } from '../../core/core.module';
import { ReusablesModule } from '../../reusables/reusables.module';
import { SharedModule } from '../../shared/shared.module';


@NgModule({ declarations: [
        RolesComponent,
        RoleFormComponent,
        ListRoleUserComponent
    ],
    exports: [
        RolesComponent,
        RoleFormComponent,
        ListRoleUserComponent
    ], imports: [
        CommonModule,
        RolesRoutingModule,
        SharedModule,
        CoreModule,
        //
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        ReusablesModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class RolesModule { }
