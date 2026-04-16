import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PresupuestoComponent } from './presupuesto.component';
import { PresupuestoListaComponent } from './presupuesto-lista/presupuesto-lista.component';
import { PresupuestoEditarComponent } from './presupuesto-editar/presupuesto-editar.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PresupuestoRoutingModule } from './presupuesto-routing.module';
import { PresupuestoDoctorListComponent } from './presupuesto-doctor-list/presupuesto-doctor-list.component';
import { ModalInstruccionesModule } from '../../modales/modal-instrucciones.module';
import { PipesModule } from '../../pipes/pipes.module';
import { ReusablesModule } from '../../reusables/reusables.module';
import { SharedModule } from '../../shared/shared.module';



@NgModule({ declarations: [
        PresupuestoComponent,
        PresupuestoListaComponent,
        PresupuestoEditarComponent,
        PresupuestoDoctorListComponent
    ], imports: [CommonModule,
        PresupuestoRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        SharedModule,
        ReusablesModule,
        PipesModule,
        ModalInstruccionesModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class PresupuestoModule { }
