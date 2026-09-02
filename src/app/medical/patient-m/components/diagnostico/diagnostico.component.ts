import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-diagnostico',
  standalone:false,
  templateUrl: './diagnostico.component.html',
  styleUrl: './diagnostico.component.scss'
})
export class DiagnosticoComponent {
  @Input()patientForm:FormGroup;
text_validation:string;

@ViewChild('textareaDiag') textareaDiag!: ElementRef;
  focarDiagnostico() {
    setTimeout(() => { 
      if (this.textareaDiag) this.textareaDiag.nativeElement.focus(); 
    }, 50);
  }

}
