import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MedicalRoutingModule } from './medical-routing.module';
import { MedicalComponent } from './medical.component';
import { SharedModule } from '../shared/shared.module';
import { CoreModule } from '../core/core.module';


@NgModule({
  declarations: [
    MedicalComponent,
  ],
  imports: [
    CommonModule,
    MedicalRoutingModule,
    SharedModule,
    CoreModule
  ]
})
export class MedicalModule { }
