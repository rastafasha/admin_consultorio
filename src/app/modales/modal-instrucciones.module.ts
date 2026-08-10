import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalInicialComponent } from './modal-inicial/modal-inicial.component';
import { ModalInstruccionesComponent } from './modal-instrucciones/modal-instrucciones.component';
import { ModalImagenpagoComponent } from './modal-imagenpago/modal-imagenpago.component';
import { PipesModule } from '../pipes/pipes.module';
import { QraccesoComponent } from './qracceso/qracceso.component';



@NgModule({
  declarations: [
    ModalInicialComponent,
    ModalInstruccionesComponent,
    ModalImagenpagoComponent,
    QraccesoComponent
  ],
  exports: [
    ModalInicialComponent,
    ModalInstruccionesComponent,
    ModalImagenpagoComponent,
    QraccesoComponent
  ],
  imports: [
    CommonModule,
    PipesModule
  ]
})
export class ModalInstruccionesModule { }
