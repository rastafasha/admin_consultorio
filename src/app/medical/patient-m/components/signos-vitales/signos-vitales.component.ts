import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-signos-vitales',
  standalone: false,
  templateUrl: './signos-vitales.component.html',
  styleUrl: './signos-vitales.component.scss'
})
export class SignosVitalesComponent {
  @Input() patientForm: FormGroup;
  text_validation: string;

   // 1. Capturamos los 3 inputs reales que están dentro de este HTML hijo
    @ViewChild('inputPresion') inputPresion!: ElementRef;
    @ViewChild('inputTemperatura') inputTemperatura!: ElementRef;
    @ViewChild('inputFrecuenciaCard') inputFrecuenciaCard!: ElementRef;
    @ViewChild('inputFrecuenciaResp') inputFrecuenciaResp!: ElementRef;
    @ViewChild('inputPeso') inputPeso!: ElementRef;
    @ViewChild('inputTalla') inputTalla!: ElementRef;
  
    // 2. Creamos 3 funciones cortas para que el padre pueda accionarlas
    focarPresion() {
      setTimeout(() => { if (this.inputPresion) this.inputPresion.nativeElement.focus(); }, 50);
    }
  
    focarTemperatura() {
      setTimeout(() => { if (this.inputTemperatura) this.inputTemperatura.nativeElement.focus(); }, 50);
    }
  
    focarFrecuenciaCard() {
      setTimeout(() => { if (this.inputFrecuenciaCard) this.inputFrecuenciaCard.nativeElement.focus(); }, 50);
    }
    focarFrecuenciaResp() {
      setTimeout(() => { if (this.inputFrecuenciaResp) this.inputFrecuenciaResp.nativeElement.focus(); }, 50);
    }
    focarPeso() {
      setTimeout(() => { if (this.inputPeso) this.inputPeso.nativeElement.focus(); }, 50);
    }
    focarTalla() {
      setTimeout(() => { if (this.inputTalla) this.inputTalla.nativeElement.focus(); }, 50);
    }
}
