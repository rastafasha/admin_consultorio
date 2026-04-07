import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { routes } from 'src/app/shared/routes/routes';
import { AppointmentService } from '../../../services/appointment.service';
import { DoctorService } from '../../../services/doctor.service';
import { SpecialitieService } from '../../../services/specialitie.service';
import { SettignService } from 'src/app/core/settings/settigs.service';
import { RolesService } from '../../../services/roles.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-appointment-form',
  templateUrl: './appointment-form.component.html',
  styleUrls: ['./appointment-form.component.scss']
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
    this.appointmentService.showAppointment(+this.appointmentId!).subscribe((resp: any) => {
      const app = resp.appointment;
      this.appointmentForm.patchValue({
        name: app.patient.name,
        surname: app.patient.surname,
        phone: app.patient.phone,
        n_doc: app.patient.n_doc,
        name_companion: app.patient.name_companion || '',
        surname_companion: app.patient.surname_companion || '',
        amount: app.amount,
        date_appointment: new Date(app.date_appointment).toISOString(),
        hour: app.segment_hour.id // adjust
      });
      this.method_payment = app.method_payment || '';
      this.date_appointment = new Date(app.date_appointment).toISOString();
      this.hour = app.segment_hour.id;
      this.speciality_id = app.speciality_id;
      this.amount_add = app.amount_add || 0; // if present
      this.filtro();
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

  filtro(): void {
    const data = {
      date_appointment: this.appointmentForm.get('date_appointment')!.value,
      hour: this.hour,
      speciality_id: this.speciality_id
    };
    this.appointmentService.lisFiter(data).subscribe((resp: any) => {
      if (resp.message === 403 || resp.doctors.length === 0) {
        this.text_validation = resp.message_text;
        Swal.fire({
          position: 'top-end',
          icon: 'warning',
          title: this.text_validation,
          showConfirmButton: false,
          timer: 1500
        });
      } else {
        this.DOCTORS = resp.doctors;
        if (this.isEditMode) {
          this.highlightCurrentDoctor();
        }
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
