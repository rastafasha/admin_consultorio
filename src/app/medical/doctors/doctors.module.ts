import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DoctorsRoutingModule } from './doctors-routing.module';
import { DoctorsComponent } from './doctors.component';
import { ListDoctorComponent } from './list-doctor/list-doctor.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ProfileDoctorComponent } from './profile-doctor/profile-doctor.component';
import { DoctorsFormComponent } from './doctors-form/doctors-form.component'; 
import { PipesModule } from '../../pipes/pipes.module';
import { SharedModule } from '../../shared/shared.module';
import { ReusablesModule } from '../../reusables/reusables.module';
import { PerfilWhatsappComponent } from './perfil-whatsapp/perfil-whatsapp.component';



@NgModule({ declarations: [
    DoctorsComponent, 
    DoctorsFormComponent, 
    ListDoctorComponent, 
    ProfileDoctorComponent, 
    PerfilWhatsappComponent
],
    exports: [
        DoctorsComponent, 
        DoctorsFormComponent, 
        ListDoctorComponent, 
        ProfileDoctorComponent, 
        PerfilWhatsappComponent
    ], imports: [
        CommonModule,
        DoctorsRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        SharedModule,
        ReusablesModule,
        PipesModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class DoctorsModule { }
