import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppointmentPayRoutingModule } from './appointment-pay-routing.module';
import { AppointmentPayComponent } from './appointment-pay.component';
import { ListAppoimentPayComponent } from './list-appoiment-pay/list-appoiment-pay.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ListAppoimentCobrosComponent } from './list-appoiment-cobros/list-appoiment-cobros.component';
import { ListDoctorComponent } from './list-doctor/list-doctor.component';
import { ListCobrosDoctorComponent } from './list-cobros-doctor/list-cobros-doctor.component';
import { ModalInstruccionesModule } from '../../modales/modal-instrucciones.module';
import { PipesModule } from '../../pipes/pipes.module';
import { ReusablesModule } from '../../reusables/reusables.module';
import { SharedModule } from '../../shared/shared.module';

@NgModule({ declarations: [
        AppointmentPayComponent,
        ListAppoimentPayComponent,
        ListAppoimentCobrosComponent,
        ListDoctorComponent,
        ListCobrosDoctorComponent
    ],
    exports: [
        AppointmentPayComponent,
        ListAppoimentPayComponent,
        ListAppoimentCobrosComponent,
    ], imports: [
        CommonModule,
        AppointmentPayRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        SharedModule,
        ReusablesModule,
        ModalInstruccionesModule,
        PipesModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class AppointmentPayModule { }
