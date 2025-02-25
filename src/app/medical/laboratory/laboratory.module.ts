import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LaboratoryRoutingModule } from './laboratory-routing.module';
import { ListLaboratoryComponent } from './list-laboratory/list-laboratory.component';
import { EditLaboratoryComponent } from './edit-laboratory/edit-laboratory.component';
import { LaboratoryComponent } from './laboratory.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { ReusablesModule } from 'src/app/reusables/reusables.module';


@NgModule({
  declarations: [
    ListLaboratoryComponent,
    EditLaboratoryComponent,
    LaboratoryComponent
  ],
  imports: [
    CommonModule,
    LaboratoryRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    SharedModule,
    ReusablesModule
  ]
})
export class LaboratoryModule { }
