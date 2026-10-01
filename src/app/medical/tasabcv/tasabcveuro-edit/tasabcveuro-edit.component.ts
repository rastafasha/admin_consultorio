import { Component, OnInit, inject } from '@angular/core';
import Swal from 'sweetalert2';
import { TasaEurobcv } from '../../../models/tasaeurobcv';
import { DoctorService } from '../../../services/doctor.service';
import { TasaeurobcvService } from '../../../services/tasaeurobcv.service';
import { ClinicaService } from '../../../services/clinica.service';
import { SettignService } from '../../../services/settigs.service';
import { switchMap, of } from 'rxjs';

@Component({
  selector: 'app-tasabcveuro-edit',
  templateUrl: './tasabcveuro-edit.component.html',
  styleUrl: './tasabcveuro-edit.component.scss',
  standalone: false
})
export class TasabcveuroEditComponent implements OnInit {
  public tasasbcvEuro!: TasaEurobcv[];
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

  private clinicaService = inject(ClinicaService);
  private settingService = inject(SettignService);
  private doctorService = inject(DoctorService);
  private tasaEuroBcvService = inject(TasaeurobcvService);

  ngOnInit(): void {
    window.scrollTo(0, 0);
    const USER = localStorage.getItem("user");
    this.user = JSON.parse(USER ? USER : '');
    
    this.resolverEntornoYMoneda();
  }

  resolverEntornoYMoneda(): void {
    this.isLoading = true;
    const slugActual = this.clinicaService.obtenerSlugDeUrl();

    this.clinicaService.getClinicaBySlugCached(slugActual).pipe(
      switchMap((clinica) => {
        if (clinica && clinica.tipoClinica === 'Clinica') {
          return this.settingService.getAllSettings().pipe(
            switchMap((respSettings: any) => {
              const currentSetting = respSettings?.settings?.data[0];
              return of(currentSetting ? currentSetting.moneda : 'USD');
            })
          );
        }
        return this.doctorService.showDoctorMoneda(+this.user.id!).pipe(
          switchMap((respDoctor: any) => of(respDoctor.moneda))
        );
      })
    ).subscribe({
      next: (monedaResuelta: string) => {
        this.moneda = monedaResuelta ? monedaResuelta.toUpperCase().trim() : 'USD';
        
        if (this.moneda === 'EUR') {
          this.getEuroTasas();
        } else {
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error("❌ Error resolviendo la moneda para tasa Euro:", err);
        this.isLoading = false;
      }
    });
  }

 getEuroTasas() {
    this.isLoading = true;
    
    // 🔍 Extraemos el dueño de la tasa basándonos en la arquitectura de entorno compilada
    const targetOwnerId = this.isEnterpriseDeployment ? this.activeSettingId : this.user.id;

    if (!targetOwnerId) {
      this.isLoading = false;
      return;
    }

    // Despachamos el ID al método que acabamos de refactorizar en el servicio
    this.tasaEuroBcvService.getTasas(targetOwnerId).subscribe((resp: any) => {
      this.tasasbcvEuro = resp;
      this.isLoading = false;
    });
  }

  save() {
    if (!this.precio_dia || this.precio_dia <= 0) return;
    
    const data = { precio_dia: this.precio_dia };
    this.tasaEuroBcvService.createTasaBcv(data).subscribe((resp: any) => {
      this.precio_dia = 0;
      Swal.fire({ position: 'top-end', icon: 'success', title: 'Tasa Euro Actualizada', showConfirmButton: false, timer: 1500 });
      this.getEuroTasas();
    });
  }

  deleteTasa(tasa: any) {
    const idParaEliminar = tasa.id || tasa._id;
    if (!idParaEliminar) return;

    this.tasaEuroBcvService.deleteTasaBcv(idParaEliminar).subscribe((resp: any) => {
      this.getEuroTasas();
    });
  }
}