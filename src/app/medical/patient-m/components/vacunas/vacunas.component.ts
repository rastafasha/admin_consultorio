import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-vacunas',
  standalone: false,
  templateUrl: './vacunas.component.html',
  styleUrl: './vacunas.component.scss'
})
export class VacunasComponent implements OnInit {
  @Input() patientForm!: FormGroup;
  @Input() doctor: any;
  
  isLoading = false;
  isSaving = false;
  text_validation: string = '';
  
  public mvacunas: any = []; 
  description: any;
  name_medical: any;
  cantidad: number = 0;
  fecha_vacuna: any;

  ngOnInit() {
    // 🛡️ CONTROL DE SEGURIDAD:
    // Si el Padre no declaró la llave 'vacunas', la agregamos dinámicamente al formulario global
    if (!this.patientForm.contains('vacunas')) {
      this.patientForm.addControl('vacunas', new FormControl([]));
    }
  }

  // Actualiza el formulario del padre cada vez que el array local cambia
  private sincronizarConPadre() {
    this.patientForm.get('vacunas')?.setValue(this.mvacunas);
  }

  addVacuna() {
    if (this.name_medical && this.cantidad > 0 && this.fecha_vacuna) {
      this.mvacunas.push({
        name_medical: this.name_medical,
        fecha_vacuna: this.fecha_vacuna,
        cantidad: this.cantidad + '',
      });
      
      // 🔄 Sincronizamos la lista con el formulario del Padre
      this.sincronizarConPadre();

      // Limpieza de inputs temporales
      this.name_medical = '';
      this.fecha_vacuna = null;
      this.cantidad = 0;
    }
  }

  deleteVacuna(i: number) {
    this.mvacunas.splice(i, 1);
    
    // 🔄 Sincronizamos los cambios tras eliminar un ítem
    this.sincronizarConPadre();

    this.name_medical = '';
    this.cantidad = 0;
  }

  // ❌ Se elimina la lógica interna de guardar; el botón general ahora reside en el Padre
}
