import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-examen-fisico',
  standalone:false,
  templateUrl: './examen-fisico.component.html',
  styleUrl: './examen-fisico.component.scss'
})
export class ExamenFisicoComponent {
  @Input()patientForm:FormGroup;
  text_validation:string;
  @ViewChild('textareaExamFis') textareaExamFis!: ElementRef;
  focarExamen() {
    setTimeout(() => { 
      if (this.textareaExamFis) this.textareaExamFis.nativeElement.focus(); 
    }, 50);
  }
}
