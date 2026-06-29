import { Component, Input } from '@angular/core';
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

}
