import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-tratamiento',
  standalone: false,
  templateUrl: './tratamiento.component.html',
  styleUrl: './tratamiento.component.scss'
})
export class TratamientoComponent {
  @Input() patientForm: FormGroup;
  text_validation: string;
   @ViewChild('textareaTratamiento') textareaTratamiento!: ElementRef;
  focarTratamiento() {
    setTimeout(() => { 
      if (this.textareaTratamiento) this.textareaTratamiento.nativeElement.focus(); 
    }, 50);
  }
}
