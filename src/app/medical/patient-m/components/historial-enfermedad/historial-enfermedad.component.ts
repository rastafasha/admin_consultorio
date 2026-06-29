import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-historial-enfermedad',
  standalone:false,
  templateUrl: './historial-enfermedad.component.html',
  styleUrl: './historial-enfermedad.component.scss'
})
export class HistorialEnfermedadComponent {
  @Input()patientForm:FormGroup;
text_validation:string;

}
