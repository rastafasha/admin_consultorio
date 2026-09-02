import { Component, Input, OnInit, OnChanges, SimpleChanges, ElementRef, ViewChild } from '@angular/core'; // 1. Agrega OnChanges y SimpleChanges
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-vacunas',
  standalone: false,
  templateUrl: './vacunas.component.html',
  styleUrl: './vacunas.component.scss'
})
export class VacunasComponent implements OnInit, OnChanges { // 2. Implementa OnChanges
  @Input() patientForm!: FormGroup;
  @Input() doctor: any;
  @Input() is_vacuna: any;
  @Input() vacunasIniciales: any[] = [];

  @ViewChild('inputVacunaNombre') inputVacunaNombre!: ElementRef;
  @ViewChild('inputVacunaFecha') inputVacunaFecha!: ElementRef;
  @ViewChild('inputVacunaCantidad') inputVacunaCantidad!: ElementRef;


  isLoading = false;
  isSaving = false;
  text_validation: string = '';

  public mvacunas: any = [];
  description: any;
  name_medical: any;
  cantidad: number = 0;
  fecha_vacuna: any;


  ngOnInit() {
    if (!this.patientForm.contains('vacunas')) {
      this.patientForm.addControl('vacunas', new FormControl([]));
    }
  }

  // 3. ¡ESTA ES LA CLAVE! Escucha cuando el formulario del Padre cambia o recibe datos de la API
  ngOnChanges(changes: SimpleChanges) {
    if (changes['vacunasIniciales'] && this.vacunasIniciales) {
      this.mvacunas = [...this.vacunasIniciales];
    }
  }

  private sincronizarConPadre() {
    this.patientForm.get('vacunas')?.setValue(this.mvacunas);
  }

  focarVacunaNombre() {
    setTimeout(() => { if (this.inputVacunaNombre) this.inputVacunaNombre.nativeElement.focus(); }, 50);
  }

  focarVacunaFecha() {
    setTimeout(() => { if (this.inputVacunaFecha) this.inputVacunaFecha.nativeElement.focus(); }, 50);
  }

  focarVacunaCantidad() {
    setTimeout(() => { if (this.inputVacunaCantidad) this.inputVacunaCantidad.nativeElement.focus(); }, 50);
  }

  addVacuna() {
    if (this.name_medical && this.cantidad > 0 && this.fecha_vacuna) {
      this.mvacunas.push({
        name_medical: this.name_medical,
        fecha_vacuna: this.fecha_vacuna,
        cantidad: this.cantidad + '',
      });

      this.sincronizarConPadre();

      this.name_medical = '';
      this.fecha_vacuna = null;
      this.cantidad = 0;
    }
  }

  deleteVacuna(i: number) {
    this.mvacunas.splice(i, 1);
    this.sincronizarConPadre();

    this.name_medical = '';
    this.cantidad = 0;
  }
}
