import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // 🚀 APIs Reactivas inyectadas
import Swal from 'sweetalert2';
import { DoctorService } from '../../../services/doctor.service';
import { routes } from '../../../shared/routes/routes';
import { SettignService } from '../../../services/settigs.service';
import { environment } from '../../../../environments/environment';
import { ClinicaService } from '../../../services/clinica.service';
import { StaffService } from '../../../services/staff.service';

@Component({
    selector: 'app-general-settings',
    templateUrl: './general-settings.component.html',
    styleUrls: ['./general-settings.component.scss'],
    standalone: false
})
export class GeneralSettingsComponent implements OnInit {
  
  public routes = routes;
  public deleteIcon1 = true;
  public deleteIcon2 = true;
  public isClinic: boolean = false;

  // 📋 Estructura unificada del Formulario Reactivo
  public formGroup!: FormGroup;
  
  // Variables de control de datos existentes
  public settings: any[] = [];
  public setting_selectedId: any = null;
  public setting: any = null;

  public user:any;
  public usuario:any;
  public clinicaid:any;

  // Manejo de carga de archivos multimedia (Logos/Banners de la Clínica)
  public FILE_AVATAR: any = null;
  public IMAGE_PREVISUALIZA: any = 'assets/img/user-06.jpg';

  // Alertas y notificaciones locales de validación
  public text_validation: string = '';

  // 🔒 Captura el flag inyectado por Vercel al compilar
  public readonly isClinicMode = environment.IS_CLINIC_DEPLOYMENT;
  public nombreClinicaCRM: string = '';


  // Inyección moderna de dependencias mediante inject()
  private fb = inject(FormBuilder);
  public settingService = inject(SettignService);
  public doctorService = inject(DoctorService);
  public clinicaService = inject(ClinicaService);
  public personalService = inject(StaffService);

  ngOnInit(): void {
    this.inicializarFormularioReactivo();
    let USER = localStorage.getItem("user");
    this.user = JSON.parse(USER ? USER: '');
    this.getUserRemoto();

    
    this.doctorService.closeMenuSidebar();
    // 🏢 Si es modo clínica, cargamos de inmediato el nombre real desde MongoDB
    if (this.isClinicMode) {
      this.cargarNombreDesdeCRM();
    }

    
  }

  getUserRemoto(){
    this.personalService.getUser(this.user.id).subscribe((resp:any)=>{
      this.usuario = resp.user;
      this.clinicaid = resp.user.clinica_id
      this.getSettings();
    })  
  }
   /**
   * 🛰️ Recupera el nombre de la clínica usando el subdominio/slug de la URL
   */
  private cargarNombreDesdeCRM(): void {
    const slug = this.clinicaService.obtenerSlugDeUrl();
    this.clinicaService.getClinicaBySlugCached(slug).subscribe(clinica => {
      if (clinica) {
        this.nombreClinicaCRM = clinica.name;
      }
    });
  }

  /**
   * 🏗️ Inicializa el esquema y las validaciones del formulario reactivo
   */
 private inicializarFormularioReactivo(): void {
    this.formGroup = this.fb.group({
      // 🔥 Si es clínica, eliminamos el validador requerido de este campo
      name: ['', this.isClinicMode ? [Validators.maxLength(250)] : [Validators.required, Validators.maxLength(250)]],
      address: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9+ ]*$')]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      zip: ['', [Validators.required]],
      country: ['', [Validators.required]],
      moneda: ['USD', [Validators.required]]
    });
  }

  /**
   * 🛰️ Recupera las configuraciones de la base de datos de Laravel
   */
  getSettings(): void {
  this.settingService.getSettingByClinicaId(this.clinicaid).subscribe({
    next: (resp: any) => {
      
      // 🟢 CORREGIDO: Evaluamos directamente la propiedad 'setting' que envía tu JSON
      if (resp && resp.setting) {
        this.setting = resp.setting;
        const currentSetting = resp.setting;
        this.setting_selectedId = currentSetting.id;

        // 🟢 SOLUCIÓN SIN 'is_clinic': Evaluamos si tiene un clinica_id válido. 
        // Si no es null ni undefined, sabemos que es una clínica (true), de lo contrario es independiente (false).
        this.isClinic = currentSetting.clinica_id !== null && currentSetting.clinica_id !== undefined;

        // 🔄 Llenado automático usando los campos reales de tu base de datos
        this.formGroup.patchValue({
          name: currentSetting.name,
          address: currentSetting.address,
          phone: currentSetting.phone,
          city: currentSetting.city,
          state: currentSetting.state,
          zip: currentSetting.zip,
          country: currentSetting.country,
          moneda: currentSetting.moneda || 'USD',
          // Mapeamos el booleano al formulario si tu vista de Angular lo requiere
          is_clinic: this.isClinic 
        });

        // 🟢 CORREGIDO: En tu recurso de Laravel el campo se llama 'avatar', no 'img_logo'
        if (currentSetting.avatar) {
          this.IMAGE_PREVISUALIZA = currentSetting.avatar;
        }
      }
    },
    error: (err) => console.error('Error descargando configuraciones del servidor:', err)
  });
}


  /**
   * 🖼️ Gestiona la previsualización del logotipo de la clínica mitigando formatos inválidos
   */
  loadFile($event: any): void {
    const file = $event.target.files[0];
    if (!file) return;

    if (file.type.indexOf("image") === -1) {
      this.text_validation = 'Solamente se permiten archivos de tipo imagen (.png, .jpg, .jpeg)';
      return;
    }

    this.text_validation = '';
    this.FILE_AVATAR = file;

    const reader = new FileReader();
    reader.readAsDataURL(this.FILE_AVATAR);
    reader.onloadend = () => this.IMAGE_PREVISUALIZA = reader.result;
  }

  /**
   * 💾 Procesa el envío unificado del Formulario Reactivo construyendo el FormData de manera automática
   */
  save(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched(); // Ilumina los campos vacíos con borde rojo en el HTML
      this.text_validation = 'Por favor, complete todos los campos requeridos marcados con asterisco (*)';
      return;
    }

    this.text_validation = '';
    const formData = new FormData();

    // 🚀 EXTRACCIÓN MODERNA: Mapeamos los valores reactivos directamente al FormData en un bucle limpio
    Object.keys(this.formGroup.controls).forEach(key => {
      const value = this.formGroup.get(key)?.value;
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });

    // Adjuntamos el archivo binario de la imagen si la secretaria cargó uno nuevo
    if (this.FILE_AVATAR) {
      formData.append('imagen', this.FILE_AVATAR);
    }

    if (this.setting_selectedId) {
      // Flujo de Actualización (Update)
      this.settingService.updateSetting(formData, this.setting_selectedId).subscribe({
        next: (resp: any) => {
          console.log('✅ Configuración actualizada con éxito:', resp);
          Swal.fire('Actualizado', '¡Información general actualizada correctamente!', 'success');
          this.getSettings(); // Refrescamos la grilla sin recargar bruscamente el navegador
        },
        error: (err) => console.error('Error al actualizar configuraciones:', err)
      });
    } else {
      // Flujo de Creación Inicial (Store)
      this.settingService.createSetting(formData).subscribe({
        next: (resp: any) => {
          console.log('✅ Configuración inicial guardada:', resp);
          Swal.fire('Guardado', '¡Establecimiento registrado con éxito!', 'success');
          this.formGroup.reset({ moneda: 'USD' }); // Reseteamos manteniendo la divisa por defecto
          this.FILE_AVATAR = null;
          this.getSettings();
        },
        error: (err) => console.error('Error al registrar configuración por primera vez:', err)
      });
    }
  }

  /**
   * 🧹 Helper visual: Permite comprobar de forma rápida si un campo tiene errores en la vista HTML
   */
  isFieldInvalid(fieldName: string): boolean {
    const control = this.formGroup.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}