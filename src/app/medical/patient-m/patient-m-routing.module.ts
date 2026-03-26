import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PatientMComponent } from './patient-m.component';
import { ListPatientMComponent } from './list-patient-m/list-patient-m.component';
import { ProfilePatientMComponent } from './profile-patient-m/profile-patient-m.component';
import { PatientDoctorListComponent } from './patient-doctor-list/patient-doctor-list.component';
import { PatientFormMComponent } from './patient-form-m/patient-form-m.component';

const routes: Routes = [
  {
    path: '', component: PatientMComponent,
    children: [
      { path: 'add', component: PatientFormMComponent },
      { path: 'list', component: ListPatientMComponent },
      { path: 'list/doctor/:doctor_id', component: PatientDoctorListComponent },
      { path: 'list/edit/:id', component: PatientFormMComponent },
      {
        path: 'profile/:id', component: ProfilePatientMComponent
      },

    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PatientMRoutingModule { }
