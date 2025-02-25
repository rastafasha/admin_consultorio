import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MedicalComponent } from './medical.component';
import { AuthGuard } from '../shared/gaurd/auth.guard';

const routes: Routes = [
  {path:'', component:MedicalComponent,
  canActivate:[AuthGuard],
  children:[
    {
      path: 'roles',
      loadChildren: () =>
        import('./roles/roles.module').then((m) => m.RolesModule),
    },
    {
      path: 'staffs',
      loadChildren: () =>
        import('./staff/staff.module').then((m) => m.StaffModule),
    },
    {
      path: 'specialities',
      loadChildren: () =>
        import('./specialitie/specialitie.module').then((m) => m.SpecialitieModule),
    },
    {
      path: 'doctors',
      loadChildren: () =>
        import('./doctors/doctors.module').then((m) => m.DoctorsModule),
    },
    {
      path: 'patients',
      loadChildren: () =>
        import('./patient-m/patient-m.module').then((m) => m.PatientMModule),
    },
    {
      path: 'appointments',
      loadChildren: () =>
        import('./appointment/appointment.module').then((m) => m.AppointmentModule),
    },
    {
      path: 'appointment-pay',
      loadChildren: () =>
        import('./appointment-pay/appointment-pay.module').then((m) => m.AppointmentPayModule),
    },
    {
      path: 'appointment-calendar',
      loadChildren: () =>
        import('./calendar-appointment/calendar-appointment.module').then((m) => m.CalendarAppointmentModule),
    },
    {
      path: 'publicidad',
      loadChildren: () =>
        import('./pub/pub.module').then((m) => m.PubModule),
    },
    {
      path: 'location',
      loadChildren: () =>
        import('./location/location.module').then((m) => m.LocationModule),
    },
    {
      path: 'laboratory',
      loadChildren: () =>
        import('./laboratory/laboratory.module').then((m) => m.LaboratoryModule),
    },
    {
      path: 'presupuesto',
      loadChildren: () =>
        import('./presupuesto/presupuesto.module').then((m) => m.PresupuestoModule),
    },
  ]  
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MedicalRoutingModule { }
