import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalInicialComponent } from './modal-inicial/modal-inicial.component';
import { ModalInstruccionesComponent } from './modal-instrucciones/modal-instrucciones.component';



@NgModule({
  declarations: [
    ModalInicialComponent,
    ModalInstruccionesComponent
  ],
  exports: [
    ModalInicialComponent,
    ModalInstruccionesComponent
  ],
  imports: [
    CommonModule
  ]
})
export class ModalInstruccionesModule { }
