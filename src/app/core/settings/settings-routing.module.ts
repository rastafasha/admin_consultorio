import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsComponent } from './settings.component';

const routes: Routes = [
  { path: '', component: SettingsComponent,
  children: [
    
    {
      path: 'payment-settings',
      loadChildren: () =>
        import('./payment-settings/payment-settings.module').then(
          (m) => m.PaymentSettingsModule
        ),
    },
    {
      path: 'payment-settings/doctor/:doctor_id',
      loadChildren: () =>
        import('./payment-settings/payment-settings.module').then(
          (m) => m.PaymentSettingsModule
        ),
    },
  { path: 'general-settings', loadChildren: () => import('./general-settings/general-settings.module').then(m => m.GeneralSettingsModule) }

  ]},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsRoutingModule {}
