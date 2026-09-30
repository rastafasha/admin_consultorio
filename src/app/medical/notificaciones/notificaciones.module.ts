import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificacionesListComponent } from './notificaciones-list/notificaciones-list.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NotificacionesRoutingModule } from './notificaciones-routing.module';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { PipesModule } from '../../pipes/pipes.module';
import { NotificacionesComponent } from './notificaciones.component';



@NgModule({
  declarations: [
    NotificacionesListComponent,
    NotificacionesComponent
  ],
  imports: [
    CommonModule,
    NotificacionesRoutingModule,
    RouterModule,
    SharedModule,
    PipesModule,
  ],
  providers: [provideHttpClient(withInterceptorsFromDi())] })

export class NotificacionesModule { }
