import { Component, OnInit, inject } from '@angular/core';
import Swal from 'sweetalert2';
import { Tasabcv } from '../../../models/tasabcba'; // Ajusta la ruta exacta si es tasabcv.service
import { DoctorService } from '../../../services/doctor.service';
import { ClinicaService } from '../../../services/clinica.service';
import { SettignService } from '../../../services/settigs.service'; // Ajusta la ruta exacta si es settign.service o settings.service
import { switchMap, of } from 'rxjs';
import { TasadollarbcvService } from '../../../services/tasabcv.service';

@Component({
    selector: 'app-tasabcv-edit',
    templateUrl: './tasabcv-edit.component.html',
    styleUrls: ['./tasabcv-edit.component.scss'],
    standalone: false
})
export class TasabcvEditComponent implements OnInit {
  public tasasbcv!: Tasabcv[];
  error!: string;
  uploadError!: string;
  precio_dia!: number;
  tipoSeleccionado = false;
  title = 'Tasa de cambio BCV';
  isLoading = false;
  user: any;
  roles: any;
  moneda!: string;
  isEnterpriseDeployment = false;
activeSettingId: any;

  // 🚀 Inyección moderna libre de constructores rústicos
  private clinicaService = inject(ClinicaService);
  private settingService = inject(SettignService);
  private doctorService = inject(DoctorService);
  private tasaBcvService = inject(TasadollarbcvService);

  ngOnInit(): void {
    window.scrollTo(0, 0);
    const USER = localStorage.getItem("user");
    this.user = JSON.parse(USER ? USER : '');
    this.roles = this.user.roles[0];
    
    this.resolverEntornoYMoneda();
  }

  /**
   * 🏢 MOTOR POLIMÓRFICO: Resuelve de dónde heredar la divisa base
   */
  resolverEntornoYMoneda(): void {
  this.isLoading = true;
  const slugActual = this.clinicaService.obtenerSlugDeUrl(); // 1. Lee el subdominio de Vercel

  // 2. Consulta al CRM de Node.js si ese subdominio es un Consultorio o una Clínica Enterprise
  this.clinicaService.getClinicaBySlugCached(slugActual).pipe(
    switchMap((clinica) => {
      
      // 🏢 CASO A: SI ES UNA CLÍNICA ENTERPRISE
      if (clinica && clinica.tipoClinica === 'Clinica') {
        return this.settingService.getAllSettings().pipe(
          switchMap((respSettings: any) => {
            // Extrae el primer registro general de configuración de tu Laravel
            const currentSetting = respSettings?.settings?.data[0]; 
            
            return of({ 
              moneda: currentSetting ? currentSetting.moneda : 'USD', 
              isEnterprise: true,            // 🌟 De aquí nace 'isEnterpriseDeployment'
              settingId: currentSetting?.id  // 🌟 De aquí nace 'activeSettingId' (ID autoincremental de Laravel)
            });
          })
        );
      }

      // 🩺 CASO B: SI ES UN CONSULTORIO TRADICIONAL
      return this.doctorService.showDoctorMoneda(+this.user.id!).pipe(
        switchMap((respDoctor: any) => of({ 
          moneda: respDoctor.moneda, 
          isEnterprise: false, // 🌟 Si es consultorio, no es Enterprise
          settingId: null      // 🌟 No requiere ID de configuración general
        }))
      );
    })
  ).subscribe({
    next: (contexto: any) => {
      // 3. 🎯 AQUÍ SE ASIGNAN EN MEMORIA DENTRO DEL COMPONENTE:
      this.moneda = contexto.moneda ? contexto.moneda.toUpperCase().trim() : 'USD';
      
      this.isEnterpriseDeployment = contexto.isEnterprise; // <- Toma el valor true o false
      this.activeSettingId = contexto.settingId;           // <- Almacena el ID del setting de la clínica (ej: 1, 2)

      // Una vez que el componente ya sabe quién es el dueño, carga las tasas de forma segura
      this.getTasas();
    }
  });
}

  getTasas() {
    this.isLoading = true;
    
    // 🚀 EXTRAEMOS EL DUEÑO REAL (ID de la Configuración si es Clínica, ID del Médico si es Consultorio)
    const targetOwnerId = this.isEnterpriseDeployment ? this.activeSettingId : this.user.id;

    if (!targetOwnerId) {
      this.isLoading = false;
      return;
    }

    // Le pasamos el ID al método del servicio para que Node.js filtre correctamente en Mongoose
    this.tasaBcvService.getTasas(targetOwnerId).subscribe((resp: any) => {
      this.tasasbcv = resp;
      this.isLoading = false;
    });
  }

  save() {
    if (!this.precio_dia || this.precio_dia <= 0) {
      Swal.fire('Atención', 'Debe ingresar un monto válido de tasa de cambio.', 'warning');
      return;
    }
    const data = { precio_dia: this.precio_dia };
    this.tasaBcvService.createTasaBcv(data).subscribe((resp: any) => {
      this.precio_dia = 0;
      Swal.fire({ position: 'top-end', icon: 'success', title: 'Tasa Actualizada', showConfirmButton: false, timer: 1500 });
      this.getTasas();
    });
  }

  deleteTasa(tasa: any) {
    const idParaEliminar = tasa.id || tasa._id;
    if (!idParaEliminar) return;

    this.tasaBcvService.deleteTasaBcv(idParaEliminar).subscribe((resp: any) => {
      this.getTasas();
    });
  }
}