import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalInicialComponent } from './modal-inicial/modal-inicial.component';



@NgModule({
  declarations: [
    ModalInicialComponent
  ],
  exports: [
    ModalInicialComponent
  ],
  imports: [
    CommonModule
  ]
})
export class ModalInstruccionesModule { }
