import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CalendarAppointmentRoutingModule } from './calendar-appointment-routing.module';
import { CalendarAppointmentComponent } from './calendar-appointment.component';
import { AppointmentCalendarComponent } from './appointment-calendar/appointment-calendar.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ReusablesModule } from '../../reusables/reusables.module';
import { SharedModule } from '../../shared/shared.module';


@NgModule({ declarations: [
        CalendarAppointmentComponent,
        AppointmentCalendarComponent
    ], imports: [CommonModule,
        CalendarAppointmentRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        SharedModule,
        ReusablesModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class CalendarAppointmentModule { }
