import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-signos-vitales',
  standalone: false,
  templateUrl: './signos-vitales.component.html',
  styleUrl: './signos-vitales.component.scss'
})
export class SignosVitalesComponent {
  @Input() patientForm: FormGroup;
  text_validation: string;
}
