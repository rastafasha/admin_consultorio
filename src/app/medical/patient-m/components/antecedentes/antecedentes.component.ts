import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-antecedentes',
  standalone: false,
  templateUrl: './antecedentes.component.html',
  styleUrl: './antecedentes.component.scss'
})
export class AntecedentesComponent {
  @Input() patientForm: FormGroup;

  // 1. Capturamos los 3 inputs reales que están dentro de este HTML hijo
  @ViewChild('inputPersonales') inputPersonales!: ElementRef;
  @ViewChild('inputFamiliares') inputFamiliares!: ElementRef;
  @ViewChild('inputAlergias') inputAlergias!: ElementRef;

  // 2. Creamos 3 funciones cortas para que el padre pueda accionarlas
  focarPersonales() {
    setTimeout(() => { if (this.inputPersonales) this.inputPersonales.nativeElement.focus(); }, 50);
  }

  focarFamiliares() {
    setTimeout(() => { if (this.inputFamiliares) this.inputFamiliares.nativeElement.focus(); }, 50);
  }

  focarAlergias() {
    setTimeout(() => { if (this.inputAlergias) this.inputAlergias.nativeElement.focus(); }, 50);
  }
}
