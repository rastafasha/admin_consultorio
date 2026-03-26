import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DoctorsRoutingModule } from './doctors-routing.module';
import { DoctorsComponent } from './doctors.component';
import { ListDoctorComponent } from './list-doctor/list-doctor.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { ProfileDoctorComponent } from './profile-doctor/profile-doctor.component';
import { DoctorsFormComponent } from './doctors-form/doctors-form.component'; import { ReusablesModule } from 'src/app/reusables/reusables.module';


@NgModule({
  declarations: [DoctorsComponent, DoctorsFormComponent, ListDoctorComponent, ProfileDoctorComponent],
  exports: [DoctorsComponent, DoctorsFormComponent, ListDoctorComponent, ProfileDoctorComponent],
  imports: [
    CommonModule,
    DoctorsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    SharedModule,
    ReusablesModule
  ]
})
export class DoctorsModule { }
