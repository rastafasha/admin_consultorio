import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotificacionesListComponent } from '../notificaciones/notificaciones-list/notificaciones-list.component';
import { NotificacionesComponent } from './notificaciones.component';

const routes: Routes = [
  {path:'', component:NotificacionesComponent,
  children:[    
    {
      path:'list', component:NotificacionesListComponent
    },
    
  ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotificacionesRoutingModule { }
