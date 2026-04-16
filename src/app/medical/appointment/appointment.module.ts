import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppointmentRoutingModule } from './appointment-routing.module';
import { AppointmentComponent } from './appointment.component';
import { ListAppointmentsComponent } from './list-appointments/list-appointments.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AtencionMedicaComponent } from './atencion-medica/atencion-medica.component';
import { ListDocComponent } from './list-doc/list-doc.component';
import { AtenderComponent } from './atender/atender.component';
import { AppointmentFormComponent } from './appointment-form/appointment-form.component';
import { ModalInstruccionesModule } from '../../modales/modal-instrucciones.module';
import { PipesModule } from '../../pipes/pipes.module';
import { ReusablesModule } from '../../reusables/reusables.module';
import { SharedModule } from '../../shared/shared.module';


@NgModule({ declarations: [
        AppointmentComponent,
        AppointmentFormComponent,
        ListAppointmentsComponent,
        AtencionMedicaComponent,
        ListDocComponent,
        AtenderComponent
    ],
    exports: [
        AppointmentComponent,
        AppointmentFormComponent,
        ListAppointmentsComponent,
        AtencionMedicaComponent,
        AtenderComponent
    ], imports: [
        CommonModule,
        AppointmentRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        SharedModule,
        PipesModule,
        ReusablesModule,
        ModalInstruccionesModule], 
        providers: [provideHttpClient(withInterceptorsFromDi())] })
export class AppointmentModule { }
