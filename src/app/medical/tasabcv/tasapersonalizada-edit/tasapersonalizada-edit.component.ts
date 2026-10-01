import { Component, OnInit, inject } from '@angular/core';
import { TasaPersonalizada } from '../../../models/tasaPersonalizada';
import { TasapersonalizadaService } from '../../../services/tasapersonalizada.service';
import { ClinicaService } from '../../../services/clinica.service';
import { SettignService } from '../../../services/settigs.service';
import { DoctorService } from '../../../services/doctor.service';
import Swal from 'sweetalert2';
import { switchMap, of } from 'rxjs';

@Component({
  selector: 'app-tasapersonalizada-edit',
  templateUrl: './tasapersonalizada-edit.component.html',
  styleUrl: './tasapersonalizada-edit.component.scss',
  standalone: false
})
export class TasapersonalizadaEditComponent implements OnInit {
  public tasasPersonalizada!: TasaPersonalizada;
  error!: string;
  uploadError!: string;
  precio_dia!: number;
  tipoSeleccionado = false;
  title = 'Tasa de cambio Fija';
  isLoading = false;
  user: any;
  roles: any;
  moneda!: string;

  // Parámetros de enlace dinámico para el guardado multi-tenant
  public activeSettingId: any = null;
  public isEnterpriseDeployment = false;

  private clinicaService = inject(ClinicaService);
  private settingService = inject(SettignService);
  private doctorService = inject(DoctorService);
  private tasaPersonalizadaService = inject(TasapersonalizadaService);

  ngOnInit(): void {
    window.scrollTo(0, 0);
    const USER = localStorage.getItem("user");
    this.user = JSON.parse(USER ? USER : '');
    this.roles = this.user.roles[0];
    
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
              return of({ 
                moneda: currentSetting ? currentSetting.moneda : 'USD', 
                isEnterprise: true, 
                settingId: currentSetting?.id 
              });
            })
          );
        }
        return this.doctorService.showDoctorMoneda(+this.user.id!).pipe(
          switchMap((respDoctor: any) => of({ moneda: respDoctor.moneda, isEnterprise: false, settingId: null }))
        );
      })
    ).subscribe({
      next: (contexto: any) => {
        this.moneda = contexto.moneda ? contexto.moneda.toUpperCase().trim() : 'USD';
        this.isEnterpriseDeployment = contexto.isEnterprise;
        this.activeSettingId = contexto.settingId;
        
        if (this.moneda === 'PERSONALIZADA') {
          this.getPersonalizadaTasas();
        } else {
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error("❌ Error resolviendo contexto para tasa Fija:", err);
        this.isLoading = false;
      }
    });
  }

  getPersonalizadaTasas() {
    this.isLoading = true;
    // Evaluamos dinámicamente si consulta por el ID del registro de la clínica o por el ID del médico
    const targetId = this.isEnterpriseDeployment ? this.activeSettingId : this.user.id;

    if (!targetId) {
      this.isLoading = false;
      return;
    }

    this.tasaPersonalizadaService.getTasasByUser(targetId).subscribe((resp: any) => {
      this.tasasPersonalizada = resp.tasa;
      this.isLoading = false;
    });
  }

  save() {
    if (!this.precio_dia || this.precio_dia <= 0) return;

    // Vinculamos de forma polimórfica al ID institucional de la sucursal o al ID del doctor
    const targetOwnerId = this.isEnterpriseDeployment ? this.activeSettingId : this.user.id;

    const data = {
      precio_dia: this.precio_dia,
      usuario: targetOwnerId // Consistente con lo que espera recibir tu endpoint en MAMP
    };

    this.tasaPersonalizadaService.createTasa(data).subscribe((resp: any) => {
      this.precio_dia = 0;
      Swal.fire({ position: 'top-end', icon: 'success', title: 'Tasa Fija Sincronizada', showConfirmButton: false, timer: 1500 });
      this.getPersonalizadaTasas();
    });
  }

  deleteTasa(tasasPersonalizada: any) {
    const idParaEliminar = tasasPersonalizada.id || tasasPersonalizada._id;
    if (!idParaEliminar) return;

    this.tasaPersonalizadaService.deleteTasaPersonalizada(idParaEliminar).subscribe((resp: any) => {
      this.getPersonalizadaTasas();
    });
  }
}