import { Component, Input, OnInit } from '@angular/core'; // 👈 Agregamos OnInit
import { FormGroup, FormControl } from '@angular/forms'; // 👈 Importamos FormControl

@Component({
  selector: 'app-evolucion',
  standalone: false,
  templateUrl: './evolucion.component.html',
  styleUrl: './evolucion.component.scss'
})
export class EvolucionComponent implements OnInit { // 👈 Implementamos OnInit
  @Input() patientForm!: FormGroup;
  
  isLoading = false;
  isSaving = false;
  text_validation: string;
  public mevolucion: any = []; 
  name_evolucion: any;
  fecha_evolucion: any; // Cambiado a any para soportar la limpieza con null

  ngOnInit() {
    // 🛡️ Si el Padre no declaró la llave 'evolucion', la creamos dinámicamente
    if (!this.patientForm.contains('evolucion')) {
      this.patientForm.addControl('evolucion', new FormControl([]));
    }
  }

  // 🔄 Método de ayuda para mantener al Padre actualizado en tiempo real
  private sincronizarConPadre() {
    this.patientForm.get('evolucion')?.setValue(this.mevolucion);
  }

  addEvolucion() {
    if (this.name_evolucion && this.fecha_evolucion) {
      this.mevolucion.push({
        name_evolucion: this.name_evolucion,
        fecha_evolucion: this.fecha_evolucion,
      });

      // 📲 Notificamos al Padre de la nueva fila agregada
      this.sincronizarConPadre();

      this.name_evolucion = '';
      this.fecha_evolucion = null;
    }
  }

  deleteEvolucion(i: any) {
    this.mevolucion.splice(i, 1);
    
    // 📲 Notificamos al Padre del elemento eliminado
    this.sincronizarConPadre();

    this.name_evolucion = '';
    this.fecha_evolucion = null;

    if (this.mevolucion.length === 0) {
      this.name_evolucion = '';
      this.fecha_evolucion = null;
    }
  }

  // ❌ Eliminamos la función save() vacía, ya que el Padre tiene la responsabilidad exclusiva del guardado
}
