import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-acompanantes',
  standalone:false,
  templateUrl: './acompanantes.component.html',
  styleUrl: './acompanantes.component.scss'
})
export class AcompanantesComponent {
  @Input() patientForm!: FormGroup; 

}
