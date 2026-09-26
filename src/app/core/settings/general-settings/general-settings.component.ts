import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // 🚀 APIs Reactivas inyectadas
import Swal from 'sweetalert2';
import { DoctorService } from '../../../services/doctor.service';
import { routes } from '../../../shared/routes/routes';
import { SettignService } from '../settigs.service';

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

  // 📋 Estructura unificada del Formulario Reactivo
  public formGroup!: FormGroup;
  
  // Variables de control de datos existentes
  public settings: any[] = [];
  public setting_selectedId: any = null;

  // Manejo de carga de archivos multimedia (Logos/Banners de la Clínica)
  public FILE_AVATAR: any = null;
  public IMAGE_PREVISUALIZA: any = 'assets/img/user-06.jpg';

  // Alertas y notificaciones locales de validación
  public text_validation: string = '';

  // Inyección moderna de dependencias mediante inject()
  private fb = inject(FormBuilder);
  public settingService = inject(SettignService);
  public doctorService = inject(DoctorService);

  ngOnInit(): void {
    this.inicializarFormularioReactivo();
    this.getSettings();
    this.doctorService.closeMenuSidebar();
  }

  /**
   * 🏗️ Inicializa el esquema y las validaciones del formulario reactivo
   */
  private inicializarFormularioReactivo(): void {
    this.formGroup = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(250)]],
      address: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9+ ]*$')]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      zip: ['', [Validators.required]],
      country: ['', [Validators.required]],
      moneda: ['USD', [Validators.required]] // 💰 Tu nuevo selector de divisas centralizado por defecto
    });
  }

  /**
   * 🛰️ Recupera las configuraciones de la base de datos de Laravel
   */
  getSettings(): void {
    this.settingService.getAllSettings().subscribe({
      next: (resp: any) => {
        console.log('📡 [Configuración] Datos cargados de Laravel:', resp);
        if (resp && resp.settings && resp.settings.data && resp.settings.data.length > 0) {
          this.settings = resp.settings.data;
          const currentSetting = resp.settings.data[0];
          this.setting_selectedId = currentSetting.id;

          // 🔄 Llenado automático e inteligente del Formulario Reactivo en caliente
          this.formGroup.patchValue({
            name: currentSetting.name,
            address: currentSetting.address,
            phone: currentSetting.phone,
            city: currentSetting.city,
            state: currentSetting.state,
            zip: currentSetting.zip,
            country: currentSetting.country,
            moneda: currentSetting.moneda || 'USD' // Asigna la moneda existente o USD por defecto
          });

          // Si el consultorio ya posee un logo guardado
          if (currentSetting.img_logo) {
            this.IMAGE_PREVISUALIZA = currentSetting.img_logo;
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