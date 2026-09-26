import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DoctorService } from '../../../services/doctor.service';
import { routes } from '../../../shared/routes/routes';
import { SettignService } from '../settigs.service';
import { ClinicaService } from '../../../services/clinica.service'; // 🚀 INYECTADO PARA DETECTAR EL SLUG/TENANT
import { PaymentMethod } from '../paymentMethod';

@Component({
    selector: 'app-payment-settings',
    templateUrl: './payment-settings.component.html',
    styleUrls: ['./payment-settings.component.scss'],
    standalone: false
})
export class PaymentSettingsComponent implements OnInit {
  public routes = routes;

  public tiposdepago!: PaymentMethod;
  error!: string;
  uploadError!: string;
  tipoSeleccionado: any;
  pagoSeleccionado: any;
  tiposdepagos: any[] = [];

  bankAccountType!: string;
  bankName!: string;
  bankAccount!: string;
  ciorif!: string;
  telefono!: string;
  email!: string;
  tipo!: string;
  user: any;
  doctor_id: any;
  roles: any;

  new_option: string = 'INACTIVE';

  // 🏢 VARIABLES ENTERPRISE: Bandera de control adaptativa
  public isEnterprise: boolean = false;

  // Inyección limpia y moderna mediante inject()
  private clinicaService = inject(ClinicaService);
  private settigService = inject(SettignService);
  private doctorService = inject(DoctorService);
  private ativatedRoute = inject(ActivatedRoute);

  ngOnInit(): void {
    this.doctorService.closeMenuSidebar();
    let USER = localStorage.getItem("user");
    this.user = JSON.parse(USER ? USER : '');
    this.roles = this.user.roles[0];
    
    this.ativatedRoute.params.subscribe((resp: any) => {
      this.doctor_id = resp.doctor_id;
      if (!this.doctor_id) {
        this.doctor_id = this.user.id;
      }
    });

    this.discernirEntornoYListarPagos();
  }

  /**
   * 🗺️ MOTOR DE LOGICA EMPRESARIAL:
   * Determina de forma automática si consulta las cuentas particulares de un doctor
   * o si invoca las sábanas de cuentas bancarias de la caja central de la clínica.
   */
  discernirEntornoYListarPagos() {
    const slugActual = this.clinicaService.obtenerSlugDeUrl();

    this.clinicaService.getClinicaBySlugCached(slugActual).subscribe({
      next: (clinica) => {
        if (clinica && clinica.tipoClinica === 'Clinica') {
          this.isEnterprise = true;
          console.log('🏢 [Caja Enterprise] Modo Clínica validado. Invocando cuentas centralizadas...');
          this.getTiposdePago(); // 🚀 Llama al index unificado (Filtra por clinica_id mediante cabeceras)
        } else {
          this.isEnterprise = false;
          console.log('Doc [Caja Pro] Modo Consultorio validado. Invocando cuentas propias del médico...');
          this.getTiposdePagoByDoctor(); // Flujo tradicional por ID de doctor
        }
      },
      error: (err) => console.error('Error sincronizando el entorno de caja con Node.js:', err)
    });
  }

  isPermission(permission: string) {
    if (this.user.roles.includes('SUPERADMIN')) {
      return true;
    }
    if (this.user.permissions && this.user.permissions.includes(permission)) {
      return true;
    }
    return false;
  }

  selectedTypeEdit(tipo: any) {
    this.pagoSeleccionado = tipo;
  }

  selectedType(tipodepago: any) {
    this.tipoSeleccionado = tipodepago;
  }

  /**
   * 🏢 LISTADO CENTRALIZADO (Para la secretaria / Asistente de Caja Enterprise)
   */
  getTiposdePago() {
    // Al usar getAllTiposDePagos se inyectan en automático los HttpHeaders 'X-Clinica-Slug'
    this.settigService.getAll().subscribe({
      next: (resp: any) => {
        console.log('📡 [Caja] Cuentas bancarias centralizadas cargadas:', resp);
        this.tiposdepagos = resp.tiposdepagos;
      },
      error: (err) => console.error('Error al descargar los métodos de pago globales:', err)
    });
  }

  /**
   * 🟢 LISTADO TRADICIONAL (Para el consultorio de un médico independiente)
   */
  getTiposdePagoByDoctor() {
    this.settigService.getPagoByDoctor(this.doctor_id).subscribe({
      next: (resp: any) => {
        this.tiposdepagos = resp.tiposdepagos;
      },
      error: (err) => console.error('Error al descargar los métodos de pago del doctor:', err)
    });
  }
  
  cambiarStatus(tipodepago: any) {
    this.settigService.updateStatus(tipodepago, tipodepago.id).subscribe({
      next: (resp) => {
        this.actualizarTablaVisual();
      },
      error: (err) => console.error('Error al mutar estatus de cuenta:', err)
    });
  }

  save() {
    let data: any = {
      tipo: this.tipo,
      bankAccountType: this.bankAccountType,
      bankName: this.bankName,
      bankAccount: this.bankAccount,
      ciorif: this.ciorif,
      telefono: this.telefono,
      email: this.email,
    };

    // 🛡️ CONDICIÓN DE LLAVE CONTEXTUAL: Si es clínica el doctor_id viaja nulo, si no se le asigna el del médico
    if (this.isEnterprise) {
      data.doctor_id = null;
    } else {
      data.doctor_id = this.doctor_id;
    }

    this.settigService.create(data).subscribe({
      next: (resp: any) => {
        this.actualizarTablaVisual();
        // 🧹 Limpieza rápida de los inputs del formulario tras guardar con éxito
        this.tipo = '';
        this.bankAccountType = '';
        this.bankName = '';
        this.bankAccount = '';
        this.ciorif = '';
        this.telefono = '';
        this.email = '';
      },
      error: (err) => console.error('Error registrando método de pago:', err)
    });
  }
  
  deleteTipoPago(tiposdepago: any) {
    this.settigService.delete(tiposdepago.id).subscribe({
      next: (resp: any) => {
        this.actualizarTablaVisual();
      },
      error: (err) => console.error('Error eliminando método de pago:', err)
    });
  }

  /**
   * Helper privado para refrescar la grilla de forma reactiva respetando el flag del entorno
   */
  private actualizarTablaVisual() {
    if (this.isEnterprise) {
      this.getTiposdePago();
    } else {
      this.getTiposdePagoByDoctor();
    }
  }
}