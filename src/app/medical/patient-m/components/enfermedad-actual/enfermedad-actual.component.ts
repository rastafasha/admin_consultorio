import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-enfermedad-actual',
  standalone:false,
  templateUrl: './enfermedad-actual.component.html',
  styleUrl: './enfermedad-actual.component.scss'
})
export class EnfermedadActualComponent {
  @Input()patientForm:FormGroup;
text_validation:string;

}
