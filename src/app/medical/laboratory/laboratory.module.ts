import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LaboratoryRoutingModule } from './laboratory-routing.module';
import { ListLaboratoryComponent } from './list-laboratory/list-laboratory.component';
import { EditLaboratoryComponent } from './edit-laboratory/edit-laboratory.component';
import { LaboratoryComponent } from './laboratory.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ReusablesModule } from '../../reusables/reusables.module';
import { SharedModule } from '../../shared/shared.module';


@NgModule({ declarations: [
        ListLaboratoryComponent,
        EditLaboratoryComponent,
        LaboratoryComponent
    ], imports: [CommonModule,
        LaboratoryRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        SharedModule,
        ReusablesModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class LaboratoryModule { }
