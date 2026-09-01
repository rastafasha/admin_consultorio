import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core'; // 1. 👈 Agregamos OnChanges y SimpleChanges
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-evolucion',
  standalone: false,
  templateUrl: './evolucion.component.html',
  styleUrl: './evolucion.component.scss'
})
export class EvolucionComponent implements OnInit, OnChanges { // 2. 👈 Implementamos OnChanges
  @Input() patientForm!: FormGroup;
  @Input() evolucionesIniciales: any[] = [];
  
  isLoading = false;
  isSaving = false;
  text_validation: string = ''; // 👈 Inicializado para evitar errores de TypeScript estricto
  public mevolucion: any = []; 
  name_evolucion: any;
  fecha_evolucion: any; 

  ngOnInit() {
    if (!this.patientForm.contains('evolucion')) {
      this.patientForm.addControl('evolucion', new FormControl([]));
    }
  }

  // 3. 🧠 ¡LA SOLUCIÓN! Captura las evoluciones que el Padre cargó desde la base de datos
   ngOnChanges(changes: SimpleChanges) {
  if (changes['evolucionesIniciales'] && this.evolucionesIniciales) {
    this.mevolucion = [...this.evolucionesIniciales];
  }
}

  private sincronizarConPadre() {
    this.patientForm.get('evolucion')?.setValue(this.mevolucion);
  }

  addEvolucion() {
    if (this.name_evolucion && this.fecha_evolucion) {
      this.mevolucion.push({
        name_evolucion: this.name_evolucion,
        fecha_evolucion: this.fecha_evolucion,
      });

      this.sincronizarConPadre();

      this.name_evolucion = '';
      this.fecha_evolucion = null;
    }
  }

  deleteEvolucion(i: any) {
    this.mevolucion.splice(i, 1);
    this.sincronizarConPadre();

    this.name_evolucion = '';
    this.fecha_evolucion = null;
  }
}
