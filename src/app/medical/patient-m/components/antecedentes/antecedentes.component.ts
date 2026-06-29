import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-antecedentes',
  standalone:false,
  templateUrl: './antecedentes.component.html',
  styleUrl: './antecedentes.component.scss'
})
export class AntecedentesComponent {
   @Input()patientForm:FormGroup;
}
