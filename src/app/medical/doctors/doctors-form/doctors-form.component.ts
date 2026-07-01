import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Pais } from '../../../models/pais';
import { DoctorService } from '../../../services/doctor.service';
import { routes } from '../../../shared/routes/routes';
import { DoctorAddress } from '../../../models/DoctorAddress.model';

@Component({
  selector: 'app-doctors-form',
  templateUrl: './doctors-form.component.html',
  styleUrls: ['./doctors-form.component.scss'],
  standalone: false
})
export class DoctorsFormComponent implements OnInit {
  public routes = routes;
  public doctorForm: FormGroup;
  public isEditMode = false;
  public cargando = false;
  public doctorId: string | null = null;

  public selectedValue = '';
  public selectedValueLocation = '';
  public speciality_id: any = null;
  public roles: any[] = [];
  public specialities: any[] = [];
  public countries: Pais;
  public hours_days: any[] = [];
  public hours_selecteds: any[] = [];

  public addresses: FormArray;
  public addresss: DoctorAddress;
  public selected_address_id: any = null;
  public show_modal_address: boolean = false;


  public days_week = [
    { day: 'Lunes', class: 'table-primary' },
    { day: 'Martes', class: 'table-secondary' },
    { day: 'Miercoles', class: 'table-success' },
    { day: 'Jueves', class: 'table-warning' },
    { day: 'Viernes', class: 'table-info' }
  ];

  public FILE_AVATAR: any;
  public IMAGE_PREVISUALIZA = 'assets/img/user-06.jpg';
  public text_validation = '';

  public doctor_selected: any;

  constructor(
    private fb: FormBuilder,
    public doctorService: DoctorService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.doctorForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      mobile: [''],
      email: ['', Validators.required],
      password: ['', Validators.required],
      password_confirmation: ['', Validators.required],
      birth_date: [''],
      gender: [1],
      education: [''],
      designation: [''],
      address: [''],
      precio_cita: [0],
      // 🏥 NUEVA PROPIEDAD: Array dinámico reactivo para capturar las múltiples sedes
      addresses: this.fb.array([])
    });
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.doctorService.closeMenuSidebar();
    this.doctorId = this.activatedRoute.snapshot.paramMap.get('id');
    if (this.doctorId) {
      this.isEditMode = true;
      this.doctorForm.get('password')?.clearValidators();
      this.doctorForm.get('password_confirmation')?.clearValidators();
      this.doctorForm.get('password')?.updateValueAndValidity();
      this.doctorForm.get('password_confirmation')?.updateValueAndValidity();
    }
    this.loadConfig();


  }

  loadConfig(): void {
    this.doctorService.listConfig().subscribe((resp: any) => {
      this.roles = resp.roles;
      this.specialities = resp.specialities;
      this.countries = resp.countries;
      this.hours_days = resp.hours_days;
      if (this.isEditMode) {
        this.loadDoctor();
      }
    });
  }

  loadDoctor(): void {
    this.doctorService.showDoctor(+this.doctorId!).subscribe((resp: any) => {
      this.doctor_selected = resp.user;
      this.getAddress();
      // 🏥 TRUCO DE ORO: Si el médico ya tiene direcciones creadas,
      // pre-seleccionamos la primera automáticamente para encender los checkboxes de golpe
      if (this.doctor_selected.addresses && this.doctor_selected.addresses.length > 0) {
        this.selected_address_id = Number(this.doctor_selected.addresses[0].id);
      } else if (this.addresss) {
        // Fallback: Si usas la variable local directa
        this.selected_address_id = Number(this.addresss[0].id);
      }

      this.mapExistingSchedulesFromBackend(this.doctor_selected);
      console.log(resp)
      this.selectedValue = this.doctor_selected.roles.id;
      this.selectedValueLocation = this.doctor_selected.pais_id;
      this.speciality_id = this.doctor_selected.speciality?.id || null;
      this.doctorForm.patchValue({
        name: this.doctor_selected.name,
        surname: this.doctor_selected.surname,
        mobile: this.doctor_selected.mobile,
        email: this.doctor_selected.email,
        // birth_date: new Date(this.doctor_selected.birth_date).toISOString(),
        birth_date: this.doctor_selected.birth_date
          ? new Date(this.doctor_selected.birth_date).toISOString().substring(0, 10)
          : '',
        education: this.doctor_selected.education || '',
        designation: this.doctor_selected.designation || '',
        gender: this.doctor_selected.gender,
        address: this.doctor_selected.address || '',
        precio_cita: this.doctor_selected.precio_cita || 0
      });
      // 2. 🏥 POBLADO DINÁMICO DEL FORMARRAY DE CONSULTORIOS
      const addressFormArray = this.doctorForm.get('addresses') as FormArray;

      // Limpiamos cualquier residuo que haya quedado en memoria
      addressFormArray.clear();

      // Si el doctor seleccionado viene con consultorios desde el backend, los cargamos
      if (this.doctor_selected.addresses && Array.isArray(this.doctor_selected.addresses)) {
        this.doctor_selected.addresses.forEach((addr: any) => {

          const addressGroup = this.fb.group({
            id: [addr.id],
            name_consultorio: [addr.name_consultorio, Validators.required],
            address: [addr.address, Validators.required],
            is_active: [addr.is_active ?? true]
          });

          addressFormArray.push(addressGroup);
        });
      }
      this.IMAGE_PREVISUALIZA = this.doctor_selected.avatar;
      this.hours_selecteds = [...resp.user.schedule_selecteds];
    });

  }

  addAddress() {
    this.show_modal_address = true;
    console.log('DEBUG: Levantando modal flotante para registrar consultorio');
  }

  // 3. Método para cuando el doctor guarde la sede en el modal
  saveNewAddressFromSchedule(name: string, addressText: string) {
    if (!name || !addressText) return;

    const newAddressData = {
      user_id: this.doctor_selected.id,
      name_consultorio: name,
      address: addressText,
      is_active: true
    };

    this.doctorService.storeDoctorAddress(newAddressData).subscribe((resp: any) => {
      // ✨ Garantizamos que la propiedad exista antes de hacer el push para evitar el error
      if (!this.doctor_selected.addresses) {
        this.doctor_selected.addresses = [];
      }
      this.doctor_selected.addresses.push(resp.address);

      // La seleccionamos automáticamente en pantalla
      this.selected_address_id = resp.address.id;

      // Recargamos el flujo completo del doctor para actualizar tu tabla e historial
      // this.loadDoctor();
      this.getAddress(); // Opcional: Llama a tu función de direcciones si la usas por separado
    });
  }


  getAddress() {
    this.doctorService.getAddressesByDoctor(this.doctor_selected.id).subscribe((resp: any) => {
      this.addresss = resp.addresses;
    });
  }

  removeAddress(addr: any) {
    Swal.fire({
      title: 'Estas Seguro?',
      text: 'No podras recuperarlo!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, Borrar!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.cargando = true;
        this.doctorService.deleteDoctorAddress(addr.id).subscribe((resp: any) => {
          this.getAddress();
        });
        Swal.fire('Borrado!', 'El Archivo fue borrado.', 'success');
      }
    });
  }



  // 🏥 1. Función que se ejecuta al hacer clic sobre una fila de la tabla de consultorios
  selectAddress(addressId: any) {
    // Convertimos a número puro directamente el parámetro recibido
    this.selected_address_id = Number(addressId);
    console.log(`Configurando horarios para la sede con ID: ${this.selected_address_id}`);

    // Forzamos a Angular a recalcular el estado visual de la cuadrícula
  }

  // 🗓️ 2. LLAMA A ESTA FUNCIÓN JUSTO CUANDO RECIBAS LA RESPUESTA DEL DOCTOR DESDE EL BACKEND
  // (Normalmente dentro del método donde obtienes el perfil del doctor seleccionado)
  mapExistingSchedulesFromBackend(doctorSelected: any) {
    this.hours_selecteds = []; // Limpiamos la agenda en memoria para el re-mapeo

    // 🛡️ Validación previa de seguridad
    if (!doctorSelected || !doctorSelected.schedule_selecteds || !Array.isArray(doctorSelected.schedule_selecteds)) {
      console.log('DEBUG: El médico no contiene horarios guardados todavía.');
      return;
    }

    // 🔄 Recorremos directamente la lista plana que nos regala tu Laravel
    doctorSelected.schedule_selecteds.forEach((schedule: any) => {
      if (schedule.item) {

        // 🚀 EMPUJAMOS AL ARREGLO CON LAS LLAVES EXACTAS QUE TU MATRIZ HTML EXIGE
        this.hours_selecteds.push({
          day: { day: schedule.day_name },
          day_name: schedule.day_name, // Empareja con: hour.day_name === day.day
          hour: schedule.item.hour_start ? schedule.item.hour_start.substring(0, 5) : '', // Extrae "08:00" del "08:00:00"
          doctor_address_id: Number(schedule.doctor_address_id || this.selected_address_id || 1), // Asegura casteo numérico
          grupo: 'none',
          item: {
            id: schedule.item.id, // Empareja con: hour.item.id === item.id
            hour_start: schedule.item.hour_start,
            hour_end: schedule.item.hour_end,
            format_hour_start: schedule.item.hour_start ? schedule.item.hour_start.substring(0, 5) : '',
            format_hour_end: schedule.item.hour_end ? schedule.item.hour_end.substring(0, 5) : ''
          }
        });
      }
    });

    console.log('📊 Matriz de horarios Klyntic sincronizada con éxito:', this.hours_selecteds);
  }






  loadFile(event: any): void {
    const file = event.target.files[0];
    if (file && !file.type.startsWith('image/')) {
      this.text_validation = 'Solamente pueden ser archivos de tipo imagen';
      return;
    }
    this.text_validation = '';
    this.FILE_AVATAR = file;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => this.IMAGE_PREVISUALIZA = reader.result as string;
  }




  // Hour selection methods (exact copy from original)
  addHourItem(hours_day: any, day: any, item: any) {
    if (!this.selected_address_id) {
      alert('Por favor, seleccione un consultorio antes de asignar horarios.');
      return;
    }

    // ✨ Convertimos a número puro para evitar fallos de tipo String vs Number
    const currentAddressId = Number(this.selected_address_id);

    const INDEX = this.hours_selecteds.findIndex(
      (hour: any) => hour.day_name === day.day &&
        hour.hour === hours_day.hour &&
        hour.item.hour_start === item.hour_start &&
        hour.item.hour_end === item.hour_end &&
        Number(hour.doctor_address_id) === currentAddressId // ✨ Corrección de tipo
    );

    if (INDEX !== -1) {
      this.hours_selecteds.splice(INDEX, 1);
    } else {
      this.hours_selecteds.push({
        day,
        day_name: day.day,
        hours_day,
        hour: hours_day.hour,
        grupo: 'none',
        item,
        doctor_address_id: currentAddressId // ✨ Guardamos como número puro
      });
    }
  }


  addHourAll(hours_day: any, day: any) {
    if (!this.selected_address_id) {
      alert('Por favor, seleccione un consultorio antes de asignar horarios.');
      return;
    }

    // 🔍 1. Buscamos si el bloque completo ya está seleccionado en ESTA SEDE específica
    const INDEX = this.hours_selecteds.findIndex(
      (hour: any) => hour.day_name === day.day &&
        hour.hour === hours_day.hour &&
        hour.grupo === 'all' &&
        hour.doctor_address_id === this.selected_address_id // 🏥 Filtro por consultorio
    );

    // 📊 2. Contamos cuántas sub-horas individuales ya están marcadas para este bloque en ESTA SEDE
    const COUNT_SELECTED = this.hours_selecteds.filter(
      (hour: any) => hour.day_name === day.day &&
        hour.hour === hours_day.hour &&
        hour.doctor_address_id === this.selected_address_id // 🏥 Filtro por consultorio
    ).length;

    // CASO A: Si el bloque completo ya existía y el conteo coincide, el usuario quiere DESMARCAR TODO el bloque
    if (INDEX !== -1 && COUNT_SELECTED === hours_day.items.length) {
      hours_day.items.forEach((item: any) => {
        const INDEX_ITEM = this.hours_selecteds.findIndex(
          (hour: any) => hour.day_name === day.day &&
            hour.hour === hours_day.hour &&
            hour.item.hour_start === item.hour_start &&
            hour.item.hour_end === item.hour_end &&
            hour.doctor_address_id === this.selected_address_id // 🏥 Filtro por consultorio
        );
        if (INDEX_ITEM !== -1) {
          this.hours_selecteds.splice(INDEX_ITEM, 1);
        }
      });
    }
    // CASO B: Si falta alguna hora por marcar, el usuario quiere MARCAR TODO el bloque de esta sede
    else {
      hours_day.items.forEach((item: any) => {
        // Limpiamos duplicados locales previos de este ítem en esta misma sede antes de empujar
        const INDEX_ITEM = this.hours_selecteds.findIndex(
          (hour: any) => hour.day_name === day.day &&
            hour.hour === hours_day.hour &&
            hour.item.hour_start === item.hour_start &&
            hour.item.hour_end === item.hour_end &&
            hour.doctor_address_id === this.selected_address_id // 🏥 Filtro por consultorio
        );
        if (INDEX_ITEM !== -1) {
          this.hours_selecteds.splice(INDEX_ITEM, 1);
        }

        // Empujamos el registro vinculándolo de forma estricta a la sede actual
        this.hours_selecteds.push({
          day,
          day_name: day.day,
          hours_day,
          hour: hours_day.hour,
          grupo: 'all',
          item,
          doctor_address_id: this.selected_address_id // ✨ NUEVO: Guardamos el enlace para Laravel
        });
      });
    }
  }


  // 1. Función para que el checkbox se marque/desmarque solo
  isHourRowFullySelected(hours_day: any): boolean {
    // 🛡️ Validación de seguridad: Si no hay consultorio activo o no hay horas marcadas, no se marca nada
    if (!this.selected_address_id || !this.hours_selecteds || this.hours_selecteds.length === 0) {
      return false;
    }

    // 🏥 1. Contamos cuántos segmentos de esta hora están seleccionados estrictamente en ESTE CONSULTORIO
    const selectedCount = this.hours_selecteds.filter(h =>
      h.hour === hours_day.hour &&
      h.doctor_address_id === this.selected_address_id // Filtro obligatorio de consultorio
    ).length;

    // 🗓️ 2. El total esperado para ESTE consultorio en la pantalla actual es:
    // (Sub-segmentos de la hora) x (Días de la semana que tiene el panel)
    const expectedCount = hours_day.items.length * this.days_week.length;

    // Retorna true solo si el médico cubrió la fila completa de esta sucursal médica
    return selectedCount === expectedCount && expectedCount > 0;
  }


  // 2. Función para marcar/desmarcar toda la fila
  addHourAllDay(event: any, hours_day: any) {
    if (!this.selected_address_id) {
      event.target.checked = false;
      alert('Por favor, seleccione un consultorio antes de asignar horarios.');
      return;
    }

    const isChecked = event.target.checked;
    const rowItemIds = hours_day.items.map((i: any) => i.id);
    const currentAddressId = Number(this.selected_address_id);

    if (!isChecked) {
      // Desmarcar: Quitamos la hora de esta fila exclusivamente para este consultorio
      this.hours_selecteds = this.hours_selecteds.filter((hour: any) => {
        const isThisRow = rowItemIds.includes(hour.item.id);
        const isThisAddress = Number(hour.doctor_address_id) === currentAddressId;
        return !(isThisRow && isThisAddress);
      });
    } else {
      // Marcar: Limpiamos duplicados locales previos de esta sede antes de insertar
      this.hours_selecteds = this.hours_selecteds.filter((hour: any) => {
        const isThisRow = rowItemIds.includes(hour.item.id);
        const isThisAddress = Number(hour.doctor_address_id) === currentAddressId;
        return !(isThisRow && isThisAddress);
      });

      // 🗓️ Recorremos cada día de la semana (Lunes a Viernes/Sábado)
      this.days_week.forEach((day: any) => {
        hours_day.items.forEach((item: any) => {
          // 🚀 INYECTAMOS LA ESTRUCTURA UNIFICADA COMPLETA
          this.hours_selecteds.push({
            day: day,              // Objeto día base
            day_name: day.day,     // String del nombre (ej: "Martes") -> ¡Crucial para tu filtro del save!
            hour: hours_day.hour,
            grupo: 'all-day',
            item: item,
            doctor_address_id: currentAddressId
          });
        });
      });
    }
  }




  // Función auxiliar para que el checkbox principal se marque/desmarque solo
  isRowFull(hours_day: any): boolean {
    // 🛡️ Validación previa: Si no hay consultorio seleccionado o la cola está vacía, no está lleno
    if (!this.selected_address_id || !this.hours_selecteds || this.hours_selecteds.length === 0) {
      return false;
    }

    // 🗓️ 1. Cuenta cuántos ítems de esta hora hay en total para toda la semana en el panel
    const totalItemsInWeek = hours_day.items.length * this.days_week.length;

    // 🏥 2. Cuenta cuántos de esos están seleccionados actualmente EXCLUSIVAMENTE para este consultorio
    const selectedInWeek = this.hours_selecteds.filter((hour: any) =>
      hour.hour === hours_day.hour &&
      hour.doctor_address_id === this.selected_address_id // Filtro obligatorio de consultorio
    ).length;

    return totalItemsInWeek === selectedInWeek && totalItemsInWeek > 0;
  }



  isCheckedHourAll(hours_day: any, day: any) {
    // 🛡️ Validación previa de seguridad tradicional
    if (!this.selected_address_id || !this.hours_selecteds || this.hours_selecteds.length === 0) {
      return false;
    }

    const currentAddressId = Number(this.selected_address_id);

    // Filtramos los ítems de esta hora que ya están seleccionados para ESTA SEDE
    const selectedInThisHour = hours_day.items.filter((item: any) =>
      this.hours_selecteds.some((hour: any) =>
        hour.day_name === day.day &&
        Number(hour.doctor_address_id) === currentAddressId &&
        // ✨ SOLUCIÓN: Hacemos la comparación robusta por los tiempos del catálogo base
        hour.item.hour_start === item.hour_start &&
        hour.item.hour_end === item.hour_end
      )
    );

    // Se marca "TODOS" solo si todos los segmentos de esa hora están presentes en este consultorio
    return selectedInThisHour.length === hours_day.items.length && hours_day.items.length > 0;
  }



  isCheckedHour(hours_day: any, day: any, item: any) {
    if (!this.selected_address_id || !this.hours_selecteds || this.hours_selecteds.length === 0) {
      return false;
    }

    const currentAddressId = Number(this.selected_address_id);

    // ✨ COMPARACIÓN ENFOQUE EN ID: Buscamos coincidencia exacta de Sede, Día e ID de segmento de hora
    return this.hours_selecteds.some((hour: any) =>
      hour.day_name === day.day &&
      Number(hour.doctor_address_id) === currentAddressId &&
      hour.item.hour_start === item.hour_start &&
      hour.item.hour_end === item.hour_end
    );

  }



  save(): void {
    if (this.doctorForm.invalid) {
      this.text_validation = 'Los campos con * son obligatorios';
      return;
    }

    if (!this.isEditMode) {
      if (this.doctorForm.get('password')!.value !== this.doctorForm.get('password_confirmation')!.value) {
        this.text_validation = 'Las contraseñas deben coincidir';
        return;
      }
    }

    // 🛡️ Validación adaptada: El doctor necesita al menos una dirección cargada en la tabla
    if (!this.addresss) {
      this.text_validation = 'El médico necesita registrar al menos un consultorio/sede';
      return;
    }

    if (this.hours_selecteds.length === 0) {
      this.text_validation = 'Se requiere un horario';
      return;
    }

    const formData = new FormData();
    const formValue = this.doctorForm.value;

    formData.append('name', formValue.name);
    formData.append('surname', formValue.surname);
    formData.append('mobile', formValue.mobile || '');
    formData.append('email', formValue.email);
    formData.append('birth_date', formValue.birth_date);
    formData.append('gender', formValue.gender.toString());
    formData.append('speciality_id', this.speciality_id?.toString() || '');

    if (this.selectedValue) formData.append('role_id', this.selectedValue);
    if (formValue.education) formData.append('education', formValue.education);
    if (formValue.designation) formData.append('designation', formValue.designation);
    if (formValue.address) formData.append('address', formValue.address);
    if (formValue.precio_cita) formData.append('precio_cita', formValue.precio_cita.toString());

    if (this.isEditMode) {
      if (formValue.password) formData.append('password', formValue.password);
    } else {
      formData.append('password', formValue.password);
    }

    if (this.FILE_AVATAR) formData.append('imagen', this.FILE_AVATAR);

    // 🏥 1. ADJUNTAMOS LA LISTA DE CONSULTORIOS AL FORMDATA
    // Convertimos a JSON string para que el ciclo foreach de Laravel lo lea de un solo golpe
    formData.append('addresses', JSON.stringify(this.addresss));

    // 🗓️ 2. AGRUPAMOS LA AGENDA MULTI-CONSULTORIO POR DÍAS
    const HOUR_SCHEDULES: any = [];
    this.days_week.forEach((day: any) => {
      // ✨ SOLUCIÓN DE FILTRADO: Comparamos strings puros (ej: "Martes" === "Martes")
      // Forzamos el mapeo numérico del consultorio si deseas que viaje limpio por sucursal
      const DAYS_HOURS = this.hours_selecteds.filter((hour_select: any) =>
        hour_select.day_name === day.day
      );

      HOUR_SCHEDULES.push({
        day_name: day.day,
        children: DAYS_HOURS
      });
    });

    // Adjuntamos al FormData el array estructurado agrupado que Laravel espera recibir con sus hijos
    formData.append('schedule_hours', JSON.stringify(HOUR_SCHEDULES));


    this.text_validation = '';

    const observable = this.isEditMode
      ? this.doctorService.editDoctor(formData, +this.doctorId!)
      : this.doctorService.storeDoctor(formData);

    observable.subscribe((resp: any) => {
      if (resp.message === 403) {
        this.text_validation = resp.message_text;
      } else {
        // 🔔 DISPARADOR DE ÉXITO DE KLYNTIC
        Swal.fire('Éxito!', `Doctor ${this.isEditMode ? 'actualizado' : 'creado'} correctamente`, 'success');

        // ✨ EL TRUCO DEFINITIVO: Volvemos a disparar la carga del perfil del médico
        // Esto obligará a Angular a ir a Laravel, bajarse el JSON nuevo con las IDs reales de MAMP 
        // y ejecutar tu mapeador de horarios para refrescar los checkboxes en pantalla al instante.
        if (this.isEditMode) {
          this.loadDoctor(); // 🚀 Reemplaza 'getDoctor' por el nombre de tu función que inicializa el perfil
          this.getAddress(); // Recargamos tu lista simplificada de consultorios
        } else {
          // Si estás creando un doctor nuevo desde cero, lo ideal es redirigir a la lista general
          // o limpiar el panel borrando la selección activa
          this.hours_selecteds = [];
          // this.addressss = [];
          this.selected_address_id = null;
          this.doctorForm.reset();
        }
      }
    });
  }
  get title(): string {
    return this.isEditMode ? `Editar Doctor ` : 'Agregar Doctor';
  }



}
