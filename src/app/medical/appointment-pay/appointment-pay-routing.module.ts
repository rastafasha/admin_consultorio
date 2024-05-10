import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppointmentPayComponent } from './appointment-pay.component';
import { ListAppoimentPayComponent } from './list-appoiment-pay/list-appoiment-pay.component';
import { ListAppoimentCobrarComponent } from './list-appoiment-cobrar/list-appoiment-cobrar.component';
import { ListAppoimentCobrosComponent } from './list-appoiment-cobros/list-appoiment-cobros.component';

const routes: Routes = [
  {path:'', component:AppointmentPayComponent,
  children:[
    {
      path:'list', component:ListAppoimentPayComponent
    },
    {
      path:'list-pagos', component:ListAppoimentCobrosComponent
    },
    {
      path:'punto-de-venta', component:ListAppoimentCobrarComponent
    },
    
  ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppointmentPayRoutingModule { }
