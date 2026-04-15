import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RolesRoutingModule } from './roles-routing.module';
import { RolesComponent } from './roles.component';
import { ListRoleUserComponent } from './list-role-user/list-role-user.component';
import { CoreModule } from 'src/app/core/core.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { ReusablesModule } from 'src/app/reusables/reusables.module';
import { RoleFormComponent } from './role-form/role-form.component';


@NgModule({ declarations: [
        RolesComponent,
        RoleFormComponent,
        ListRoleUserComponent
    ],
    exports: [
        RolesComponent,
        RoleFormComponent,
        ListRoleUserComponent
    ], imports: [CommonModule,
        RolesRoutingModule,
        SharedModule,
        CoreModule,
        //
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        ReusablesModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class RolesModule { }
