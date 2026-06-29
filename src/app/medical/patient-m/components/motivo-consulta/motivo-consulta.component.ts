import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-motivo-consulta',
  standalone:false,
  templateUrl: './motivo-consulta.component.html',
  styleUrl: './motivo-consulta.component.scss'
})
export class MotivoConsultaComponent {
  @Input()patientForm:FormGroup;
text_validation:string;
}
