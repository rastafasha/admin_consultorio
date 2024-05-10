import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddDoctorComponent } from './add-doctor/add-doctor.component';
import { ListDoctorComponent } from './list-doctor/list-doctor.component';
import { EditDoctorComponent } from './edit-doctor/edit-doctor.component';
import { DoctorsComponent } from './doctors.component';
import { ProfileDoctorComponent } from './profile-doctor/profile-doctor.component';

const routes: Routes = [
  {path:'', component:DoctorsComponent,
  children:[
    {
      path:'add', component:AddDoctorComponent
    },
    {
      path:'list', component:ListDoctorComponent
    },
    {
      path:'list/edit/:id', component:EditDoctorComponent
    },
    {
      path:'profile/:id', component:ProfileDoctorComponent
    },
    
  ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DoctorsRoutingModule { }
