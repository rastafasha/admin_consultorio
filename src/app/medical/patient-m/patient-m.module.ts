import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PatientMRoutingModule } from './patient-m-routing.module';
import { PatientMComponent } from './patient-m.component';
import { ListPatientMComponent } from './list-patient-m/list-patient-m.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { ProfilePatientMComponent } from './profile-patient-m/profile-patient-m.component';
import { PatientDoctorListComponent } from './patient-doctor-list/patient-doctor-list.component';
import { PatientFormMComponent } from './patient-form-m/patient-form-m.component';
import { ReusablesModule } from 'src/app/reusables/reusables.module';
import { ModalInstruccionesModule } from 'src/app/modales/modal-instrucciones.module';


@NgModule({ declarations: [PatientMComponent, PatientFormMComponent, ListPatientMComponent, ProfilePatientMComponent, PatientDoctorListComponent],
    exports: [PatientMComponent, PatientFormMComponent, ListPatientMComponent, ProfilePatientMComponent, PatientDoctorListComponent], imports: [CommonModule,
        PatientMRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        SharedModule,
        ReusablesModule,
        ModalInstruccionesModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class PatientMModule { }
