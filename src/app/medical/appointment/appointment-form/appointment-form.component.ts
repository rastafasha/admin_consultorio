import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentService } from '../../../services/appointment.service';
import { DoctorService } from '../../../services/doctor.service';
import { SpecialitieService } from '../../../services/specialitie.service';
import Swal from 'sweetalert2';
import { SettignService } from '../../../core/settings/settigs.service';
import { RolesService } from '../../../services/roles.service';
import { routes } from '../../../shared/routes/routes';
import { DoctorAddress } from '../../../models/DoctorAddress.model';

@Component({
  selector: 'app-appointment-form',
  templateUrl: './appointment-form.component.html',
  styleUrls: ['./appointment-form.component.scss'],
  standalone: false
})
export class AppointmentFormComponent implements OnInit {
  public routes = routes;
  public appointmentForm: FormGroup;
  public isEditMode = false;
  public appointmentId: string | null = null;
  public doctor_id: any;
  public user: any;
  public roles: any;

  public hours: any[] = [];
  public specialities: any[] = [];
  public speciality_id: any;
  public date_appointment: any;
  public hour: any;
  public DOCTORS: any[] = [];
  public DOCTOR_SELECTED: any;
  public selected_segment_hour: any;
  public tiposdepagos: any[] = [];
  public patient: any = [];

  public name = '';
  public surname = '';
  public n_doc = '';
  public phone = '';
  public name_companion = '';
  public surname_companion = '';

  public amount = 0;
  public amount_add = 0;
  public method_payment = '';

  public text_validation = '';
  specialityName: string;
  schedule_selecteds: any;
  isLoading = false;
  isfiltered = false;
  DOCTOR: any = [];
  addresses: DoctorAddress[];
  segments: any[] = [];

  info_editar_cita = `
  <p>En esta sección :</p>
          <ul>
            <li>Podrás Editar una cita ya creada</li>
            <li>Cambiar la información de la cita como fecha y hora</li>
          </ul>`;


  constructor(
    private fb: FormBuilder,
    public appointmentService: AppointmentService,
    public settigService: SettignService,
    public doctorService: DoctorService,
    public specialitiService: SpecialitieService,
    public roleService: RolesService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.appointmentForm = this.fb.group({
      n_doc: ['', Validators.required],
      name: ['', Validators.required],
      surname: ['', Validators.required],
      phone: ['', Validators.required],
      name_companion: [''],
      surname_companion: [''],
      date_appointment: ['', Validators.required],
      hour: ['', Validators.required],
      amount: [0, Validators.required],
      amount_add: [0, Validators.required],
      method_payment: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.doctorService.closeMenuSidebar();
    window.scrollTo(0, 0);
    const USER = localStorage.getItem('user');
    this.user = JSON.parse(USER || '{}');
    this.doctor_id = this.user.id;
    this.roles = this.roleService.authService.user.roles[0];


    this.appointmentId = this.activatedRoute.snapshot.paramMap.get('id');
    if (this.appointmentId) {
      this.isEditMode = true;
    }
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.appointmentService.listConfig().subscribe((resp: any) => {
      this.hours = resp.hours;
      this.specialities = resp.specialities;
    });
    this.settigService.getActivoPagoByDoctor(this.doctor_id).subscribe((resp: any) => {
      this.tiposdepagos = resp.tiposdepagos;
    });
    if (this.isEditMode) {
      this.loadAppointment();
    }
  }
  loadAppointment(): void {
    this.isLoading = true;
    this.appointmentService.showAppointment(+this.appointmentId!).subscribe((resp: any) => {
      const app = resp.appointment;
      // console.log('Datos iniciales de la cita:', app);

      const fechaFormateada = app.date_appointment_format; // "2026-08-27"

      // Extraemos el ID de la hora general del bloque (el 10 de las 10 AM)
      const horaGeneralId = app.segment_hour ? +app.segment_hour.doctor_schedule_hour_id : +app.doctor_schedule_hour_id;

      // Guardamos en las variables globales del componente
      this.method_payment = app.method_payment || '';
      this.date_appointment = fechaFormateada;
      this.hour = horaGeneralId; // Guardamos el ID numérico fijo
      this.amount_add = app.amount_add || 0;

      if (app.doctor?.speciality) {
        this.specialityName = app.doctor.speciality.name;
        this.speciality_id = app.doctor.speciality.id;
      }
      this.DOCTOR_SELECTED = app.doctor_id;

      // Seteamos el formulario reactivo
      this.appointmentForm.patchValue({
        name: app.patient?.name,
        surname: app.patient?.surname,
        phone: app.patient?.phone,
        n_doc: app.patient?.n_doc,
        name_companion: app.patient?.name_companion || '',
        surname_companion: app.patient?.surname_companion || '',
        amount: app.amount,
        date_appointment: fechaFormateada,
        hour: horaGeneralId // Esto forzará al <mat-select> a seleccionar las 10 AM
      });

      this.isLoading = false;

      // Ejecutamos el filtro pasándole directamente este ID
      setTimeout(() => {
        this.filtroDoctor();
      }, 1000);
    });
  }



  filterPatient(): void {
    if (!this.appointmentForm.get('n_doc')!.value) return;
    this.appointmentService.getPatient(this.appointmentForm.get('n_doc')!.value).subscribe((resp: any) => {
      if (resp.message === 403) {
        this.resetPatientForm();
      } else {
        this.appointmentForm.patchValue({
          name: resp.name,
          surname: resp.surname,
          phone: resp.phone
        });
        this.patient = resp;
      }
    });
  }

  resetPatientForm(): void {
    this.appointmentForm.patchValue({
      name: '',
      surname: '',
      phone: '',
      n_doc: ''
    });
    this.patient = [];
  }

  onDateChange(): void {
    this.DOCTORS = [];
    this.DOCTOR_SELECTED = null;
    this.selected_segment_hour = null;
  }

  // filtro(): void {
  //   const data = {
  //     date_appointment: this.appointmentForm.get('date_appointment')!.value,
  //     hour: this.hour,
  //     speciality_id: this.speciality_id
  //   };
  //   this.appointmentService.lisFiter(data).subscribe((resp: any) => {
  //     if (resp.message === 403 || resp.doctors.length === 0) {
  //       this.text_validation = resp.message_text;
  //       Swal.fire({
  //         position: 'top-end',
  //         icon: 'warning',
  //         title: this.text_validation,
  //         showConfirmButton: false,
  //         timer: 1500
  //       });
  //     } else {
  //       this.DOCTORS = resp.doctors;
  //       if (this.isEditMode) {
  //         this.highlightCurrentDoctor();
  //       }
  //     }
  //   });
  // }

  filtroDoctor() {
    this.isfiltered = false;

    // 1. Obtener el ID de la hora seleccionada (ej: 10)
    const horaSeleccionadaId = +this.appointmentForm.get('hour')?.value || +this.hour;

    // 2. Buscar el nombre de la hora en tu arreglo "hours" (ej: "10:00 AM" o "10 AM")
    const horaObjeto = this.hours.find((h: any) => +h.id === horaSeleccionadaId);
    const nombreHora = horaObjeto ? horaObjeto.name : ''; // Esto tendrá el texto ej: "10:00 AM"

    const data = {
      date_appointment: this.date_appointment,
      hour: horaSeleccionadaId,
      speciality_id: this.speciality_id
    };

    // console.log('Filtrando para la hora ID:', horaSeleccionadaId, 'Texto:', nombreHora);

    this.appointmentService.lisFiterByDoctor(data, this.DOCTOR_SELECTED).subscribe((resp: any) => {
      // console.log('Respuesta del backend (32 segmentos):', resp);

      if (resp.message === 403 || !resp.doctor) {
        this.text_validation = resp.message_text || 'Error en la consulta';
        Swal.fire({ position: "top-end", icon: "warning", title: this.text_validation, showConfirmButton: false, timer: 1500 });
        this.segments = [];
        this.addresses = [];
        return;
      }

      this.DOCTOR = resp.doctor;
      this.addresses = resp.doctor.addresses ?? [];

      // 3. ¡EL FILTRO MANUAL AQUÍ! 
      // Si el backend te devuelve los 32, filtramos para quedarnos SOLO con los 4 de esa hora general
      if (resp.segments && Array.isArray(resp.segments)) {
        this.segments = resp.segments.filter((seg: any) => {
          // Obtenemos el ID de la hora que viene dentro del segmento
          const segHourId = seg.doctor_schedule_hour_id || seg.format_segment?.doctor_schedule_hour_id;

          // También podemos validar por texto de hora si el ID fallara en el backend
          const inicioHoraTexto = seg.format_segment?.format_hour_start || ''; // ej: "10:15 AM"

          // Condición: Que coincida el ID de la hora general (10) 
          // O que el texto del segmento empiece por el número de la hora (ej: "10:")
          return +segHourId === horaSeleccionadaId || inicioHoraTexto.startsWith(nombreHora.substring(0, 3));
        });
      } else {
        this.segments = [];
      }

      // console.log('Segmentos filtrados mostrados al usuario (Deberían ser 4):', this.segments);

      // 4. Mostramos las tablas en el HTML
      this.isfiltered = true;

      if (this.isEditMode) {
        this.highlightCurrentDoctor();
      }
    });
  }




  highlightCurrentDoctor(): void { this.DOCTORS.forEach((doctor: any) => { if (doctor.doctor.id === this.DOCTOR_SELECTED.doctor_id) { const INDEX = doctor.segments.findIndex((item: any) => item.id === this.DOCTOR_SELECTED.doctor_schedule_join_hour_id); if (INDEX !== -1) { this.DOCTOR_SELECTED = doctor; } } }); }

  countDisponibilidad(DOCTOR: any): number {
    return DOCTOR.segments.filter((item: any) => !item.is_appointment).length;
  }

  showSegment(DOCTOR: any): void {
    this.DOCTOR_SELECTED = DOCTOR;
  }

  selecSegment(SEGMENT: any): void {
    this.selected_segment_hour = SEGMENT;
  }

  isDoctorSelected(DOCTOR: any): boolean { if (this.isEditMode) { return DOCTOR.doctor.id === this.DOCTOR_SELECTED.doctor_id; } return false; }

  isSegmentSelected(SEGMENT: any): boolean { if (this.isEditMode) { return SEGMENT.id === this.DOCTOR_SELECTED.doctor_schedule_join_hour_id; } return false; }

  save(): void {
    if (this.appointmentForm.invalid) {
      this.text_validation = 'Los campos requeridos son obligatorios';
      return;
    }

    if (this.amount < this.amount_add) {
      this.text_validation = 'El adelanto no puede ser mayor al total';
      return;
    }

    if (!this.name || !this.surname || !this.n_doc || !this.phone || !this.date_appointment || !this.speciality_id || !this.selected_segment_hour || !this.amount || !this.amount_add || !this.method_payment) {
      this.text_validation = 'Todos los campos son necesarios (incluyendo segmento)';
      return;
    }

    const data = {
      doctor_id: this.DOCTOR_SELECTED.doctor.id,
      user_id: this.patient.id,
      name: this.name,
      surname: this.surname,
      n_doc: this.n_doc,
      phone: this.phone,
      name_companion: this.name_companion,
      surname_companion: this.surname_companion,
      date_appointment: this.date_appointment,
      speciality_id: this.speciality_id,
      doctor_schedule_join_hour_id: this.selected_segment_hour.id,
      amount: this.amount,
      amount_add: this.amount_add,
      method_payment: this.method_payment
    };

    const observable = this.isEditMode
      ? this.appointmentService.editAppointment(data, +this.appointmentId!)
      : this.appointmentService.storeAppointment(data);

    observable.subscribe((resp: any) => {
      Swal.fire('Éxito!', 'Cita ' + (this.isEditMode ? 'actualizada' : 'creada'), 'success');
      this.router.navigate(['/appointments/list/doctor/', this.doctor_id]);
    });
  }

  get title(): string {
    return this.isEditMode ? 'Editar Cita' : 'Agregar Cita';
  }
}
