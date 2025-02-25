import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PatientMRoutingModule } from './patient-m-routing.module';
import { PatientMComponent } from './patient-m.component';
import { AddPatientMComponent } from './add-patient-m/add-patient-m.component';
import { ListPatientMComponent } from './list-patient-m/list-patient-m.component';
import { EditPatientMComponent } from './edit-patient-m/edit-patient-m.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { ProfilePatientMComponent } from './profile-patient-m/profile-patient-m.component';
import { PatientDoctorListComponent } from './patient-doctor-list/patient-doctor-list.component';
import { ReusablesModule } from 'src/app/reusables/reusables.module';


@NgModule({
  declarations: [
    PatientMComponent,
    AddPatientMComponent,
    ListPatientMComponent,
    EditPatientMComponent,
    ProfilePatientMComponent,
    PatientDoctorListComponent
  ],
  exports: [
    PatientMComponent,
    AddPatientMComponent,
    ListPatientMComponent,
    EditPatientMComponent,
    ProfilePatientMComponent,
    PatientDoctorListComponent
  ],
  imports: [
    CommonModule,
    PatientMRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    SharedModule,
    ReusablesModule
  ]
})
export class PatientMModule { }
