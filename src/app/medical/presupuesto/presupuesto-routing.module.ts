import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PresupuestoComponent } from './presupuesto.component';
import { PresupuestoListaComponent } from './presupuesto-lista/presupuesto-lista.component';
import { PresupuestoEditarComponent } from './presupuesto-editar/presupuesto-editar.component';
import { PresupuestoDoctorListComponent } from './presupuesto-doctor-list/presupuesto-doctor-list.component';

const routes: Routes = [
  {path:'', component:PresupuestoComponent,
  children:[
    
    {
      path:'list', component:PresupuestoListaComponent
    },
    {
      path:'list/doctor', component:PresupuestoDoctorListComponent
    },
    {
      path:'crear', component:PresupuestoEditarComponent
    },
    {
      path:'edit/:id', component:PresupuestoEditarComponent
    },
    
  ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PresupuestoRoutingModule { }
