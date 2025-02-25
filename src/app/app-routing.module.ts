import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// import { AuthGuard } from './shared/gaurd/auth.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },

  {
    path: '',
    loadChildren: () => import('./core/core.module').then((m) => m.CoreModule),
  },
  {
    path: '',
    loadChildren: () =>
      import('./authentication/authentication.module').then(
        (m) => m.AuthenticationModule
      ),
  },
  {
    path: 'medical',
    loadChildren: () => import('./medical/medical.module').then((m) => m.MedicalModule),
  },

  {
    path: 'roles',
    loadChildren: () => import('./medical/roles/roles.module').then((m) => m.RolesModule),
  },
  {
    path: 'staffs',
    loadChildren: () => import('./medical/staff/staff.module').then((m) => m.StaffModule),
  },
  {
    path: 'specialities',
    loadChildren: () =>
      import('./medical/specialitie/specialitie.module').then((m) => m.SpecialitieModule),
  },
  {
    path: 'doctors',
    loadChildren: () =>
      import('./medical/doctors/doctors.module').then((m) => m.DoctorsModule),
  },
  {
    path: 'patients',
    loadChildren: () =>
      import('./medical/patient-m/patient-m.module').then((m) => m.PatientMModule),
  },
  {
    path: 'appointments',
    loadChildren: () =>
      import('./medical/appointment/appointment.module').then((m) => m.AppointmentModule),
  },
  {
    path: 'appointment-pay',
    loadChildren: () =>
      import('./medical/appointment-pay/appointment-pay.module').then((m) => m.AppointmentPayModule),
  },
  {
    path: 'appointment-calendar',
    loadChildren: () =>
      import('./medical/calendar-appointment/calendar-appointment.module').then((m) => m.CalendarAppointmentModule),
  },
  {
    path: 'publicidad',
    loadChildren: () =>
      import('./medical/pub/pub.module').then((m) => m.PubModule),
  },
  {
    path: 'location',
    loadChildren: () =>
      import('./medical/location/location.module').then((m) => m.LocationModule),
  },

  {
    path: 'laboratory',
    loadChildren: () =>
      import('./medical/laboratory/laboratory.module').then((m) => m.LaboratoryModule),
  },
  {
    path: 'presupuesto',
    loadChildren: () =>
      import('./medical/presupuesto/presupuesto.module').then((m) => m.PresupuestoModule),
  },
  {
    path: 'error',
    loadChildren: () =>
      import('./error/error.module').then((m) => m.ErrorModule),
  },
  {
    path: '**',
    redirectTo: 'error/error404',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
