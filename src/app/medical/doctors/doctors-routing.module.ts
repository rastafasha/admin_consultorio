import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListDoctorComponent } from './list-doctor/list-doctor.component';
import { DoctorsComponent } from './doctors.component';
import { ProfileDoctorComponent } from './profile-doctor/profile-doctor.component';
import { DoctorsFormComponent } from './doctors-form/doctors-form.component';
import { PerfilWhatsappComponent } from './perfil-whatsapp/perfil-whatsapp.component';

const routes: Routes = [
  {
    path: '', component: DoctorsComponent,
    children: [
      {
        path: 'add', component: DoctorsFormComponent
      },
      {
        path: 'list', component: ListDoctorComponent
      },
      {
        path: 'list/edit/:id', component: DoctorsFormComponent
      },
      {
        path: 'profile/:id', component: ProfileDoctorComponent
      },
      {
        path: 'profile-whatsapp', component: PerfilWhatsappComponent
      },

    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DoctorsRoutingModule { }
