import { Component, OnInit, inject } from '@angular/core';
import { TasadollarbcvService } from '../../services/tasabcv.service';
import { DoctorService } from '../../services/doctor.service';
import { TasaeurobcvService } from '../../services/tasaeurobcv.service';
import { TasapersonalizadaService } from '../../services/tasapersonalizada.service';
import { ClinicaService } from '../../services/clinica.service'; 
import { switchMap, of, Observable } from 'rxjs';
import { SettignService } from '../../services/settigs.service';

@Component({
    selector: 'app-tasabcv',
    templateUrl: './tasabcv.component.html',
    styleUrls: ['./tasabcv.component.scss'],
    standalone: false
})
export class TasabcvComponent implements OnInit {
  tasa!: number;
  user: any;
  isLoading = false;
  
  public moneda!: string;
  public tasadollar: any;
  public tasaeuro: any;

  // Inyección moderna de dependencias mediante inject()
  private clinicaService = inject(ClinicaService);
  private settingService = inject(SettignService);
  private doctorService = inject(DoctorService);
  private tasaBcvService = inject(TasadollarbcvService);
  private tasaEuroBcvService = inject(TasaeurobcvService);
  private tasaPersonalizadaService = inject(TasapersonalizadaService);

  ngOnInit(): void {
    const USER = localStorage.getItem("user");
    this.user = JSON.parse(USER ? USER : '');

    this.obtenerMonedaYCalcularTasa();
  }

  /**
   * 🗺️ MOTOR INTELIGENTE MULTI-TENANT KLYNTIC
   * Discierne si consulta la divisa al médico aislado o a la caja central de la clínica
   */
  obtenerMonedaYCalcularTasa() {
    this.isLoading = true;
    const slugActual = this.clinicaService.obtenerSlugDeUrl();

    // 1. Consultamos el tipo de establecimiento al CRM de Node.js
    this.clinicaService.getClinicaBySlugCached(slugActual).pipe(
      switchMap((clinica) => {
        
        // 🏢 CASO CLINICA ENTERPRISE: Buscamos la moneda global en los settings de Laravel
        if (clinica && clinica.tipoClinica === 'Clinica') {
          console.log('🏢 [Tasa Enterprise] Modo Clínica detectado. Extrayendo divisa de SettignService...');
          
          return this.settingService.getAllSettings().pipe(
            switchMap((respSettings: any) => {
              // Extraemos el campo 'moneda' de tu primer registro de configuración general
              const currentSetting = respSettings?.settings?.data[0];
              const monedaClinica = currentSetting ? currentSetting.moneda : 'USD';
              
              // Devolvemos un objeto estandarizado para la tubería asíncrona
              return of({ moneda: monedaClinica, isEnterprise: true, settingId: currentSetting?.id });
            })
          );
        }

        // 🟢 CASO TRADICIONAL: Mantiene tu flujo intacto consultando al médico individual en Laravel
        console.log('Doc [Tasa Pro] Modo Consultorio detectado. Extrayendo divisa de DoctorService...');
        return this.doctorService.showDoctorMoneda(+this.user.id!).pipe(
          switchMap((respDoctor: any) => {
            return of({ moneda: respDoctor.moneda, isEnterprise: false, settingId: null });
          })
        );
      }),
      
      // 2. Con la moneda resuelta de forma inteligente, disparamos tu diccionario de servicios
      switchMap((contexto: any) => {
        this.moneda = contexto.moneda ? contexto.moneda.toUpperCase().trim() : 'USD';

        // 🚀 SANEADO MULTI-TENANT: Evaluamos dinámicamente el ID del dueño real (Setting ID o User ID)
        const targetOwnerId = contexto.isEnterprise ? contexto.settingId : this.user.id;

        const estrategiasTasa: { [key: string]: () => Observable<any> } = {
          // 🔥 Pasamos el ID del dueño real a los métodos refactorizados de tus servicios
          'USD': () => this.tasaBcvService.getUltimaTasa(targetOwnerId),
          'VED': () => this.tasaBcvService.getUltimaTasa(targetOwnerId), 
          'EUR': () => this.tasaEuroBcvService.getUltimaTasa(targetOwnerId),
          'PERSONALIZADA': () => this.tasaPersonalizadaService.getTasasByUser(targetOwnerId)
        };

        return estrategiasTasa[this.moneda] ? estrategiasTasa[this.moneda]() : of(null);
      })
    ).subscribe({
      next: (respTasa: any) => {
        this.isLoading = false;
        if (!respTasa) return;

        // 3. Extraemos y formateamos el valor numérico de la tasa de cambio de MAMP/Supabase
        const valorTasa = this.moneda === 'PERSONALIZADA' 
          ? (respTasa.tasa?.precio_dia || respTasa.precio_dia)
          : respTasa.precio_dia;

        // Asignación de variables limpia para tu vista HTML original
        if (this.moneda === 'USD' || this.moneda === 'VED') this.tasadollar = valorTasa;
        if (this.moneda === 'EUR') this.tasaeuro = valorTasa;
        if (this.moneda === 'PERSONALIZADA') this.tasa = valorTasa;

        console.log(`📊 [Tasa Sincronizada] Moneda activa: ${this.moneda} | Valor liquidación: ${valorTasa}`);
      },
      error: (err) => {
        console.error("❌ Error fatal procesando el flujo de divisas cruzado:", err);
        this.isLoading = false;
      }
    });
  }
}