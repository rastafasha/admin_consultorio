import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { routes } from 'src/app/shared/routes/routes';
import { DoctorService } from '../../../services/doctor.service';
import Swal from 'sweetalert2';
import { Pais } from 'src/app/models/pais';

@Component({
  selector: 'app-doctors-form',
  templateUrl: './doctors-form.component.html',
  styleUrls: ['./doctors-form.component.scss']
})
export class DoctorsFormComponent implements OnInit {
  public routes = routes;
  public doctorForm: FormGroup;
  public isEditMode = false;
  public doctorId: string | null = null;

  public selectedValue = '';
  public selectedValueLocation = '';
  public speciality_id: any = null;
  public roles: any[] = [];
  public specialities: any[] = [];
  public countries: Pais;
  public hours_days: any[] = [];
  public hours_selecteds: any[] = [];
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
      precio_cita: [0]
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
      this.selectedValue = this.doctor_selected.roles.id;
      this.selectedValueLocation = this.doctor_selected.pais_id;
      this.speciality_id = this.doctor_selected.speciality?.id || null;
      this.doctorForm.patchValue({
        name: this.doctor_selected.name,
        surname: this.doctor_selected.surname,
        mobile: this.doctor_selected.mobile,
        email: this.doctor_selected.email,
        birth_date: new Date(this.doctor_selected.birth_date).toISOString(),
        education: this.doctor_selected.education || '',
        designation: this.doctor_selected.designation || '',
        gender: this.doctor_selected.gender,
        address: this.doctor_selected.address || '',
        precio_cita: this.doctor_selected.precio_cita || 0
      });
      this.IMAGE_PREVISUALIZA = this.doctor_selected.avatar;
      this.hours_selecteds = this.doctor_selected.schedule_selecteds || [];
    });
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

    const HOUR_SCHEDULES: any = [];
    this.days_week.forEach((day: any) => {
      const DAYS_HOURS = this.hours_selecteds.filter((hour_select: any) => hour_select.day_name === day.day);
      HOUR_SCHEDULES.push({
        day_name: day.day,
        children: DAYS_HOURS
      });
    });
    formData.append('schedule_hours', JSON.stringify(HOUR_SCHEDULES));

    this.text_validation = '';

    const observable = this.isEditMode
      ? this.doctorService.editDoctor(formData, +this.doctorId!)
      : this.doctorService.storeDoctor(formData);

    observable.subscribe((resp: any) => {
      if (resp.message === 403) {
        this.text_validation = resp.message_text;
      } else {
        Swal.fire('Éxito!', `Doctor ${this.isEditMode ? 'actualizado' : 'creado'} correctamente`, 'success');
        // this.router.navigate(['/doctors/list']);
      }
    });
  }

  // Hour selection methods (exact copy from original)
  addHourItem(hours_day: any, day: any, item: any) {
    const INDEX = this.hours_selecteds.findIndex(
      (hour: any) => hour.day_name === day.day &&
        hour.hour === hours_day.hour &&
        hour.item.hour_start === item.hour_start &&
        hour.item.hour_end === item.hour_end
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
        item
      });
    }
  }

  addHourAll(hours_day: any, day: any) {
    const INDEX = this.hours_selecteds.findIndex(
      (hour: any) => hour.day_name === day.day &&
        hour.hour === hours_day.hour &&
        hour.grupo === 'all'
    );
    const COUNT_SELECTED = this.hours_selecteds.filter(
      (hour: any) => hour.day_name === day.day &&
        hour.hour === hours_day.hour
    ).length;

    if (INDEX !== -1 && COUNT_SELECTED === hours_day.items.length) {
      hours_day.items.forEach((item: any) => {
        const INDEX_ITEM = this.hours_selecteds.findIndex(
          (hour: any) => hour.day_name === day.day &&
            hour.hour === hours_day.hour &&
            hour.item.hour_start === item.hour_start &&
            hour.item.hour_end === item.hour_end
        );
        if (INDEX_ITEM !== -1) {
          this.hours_selecteds.splice(INDEX_ITEM, 1);
        }
      });
    } else {
      hours_day.items.forEach((item: any) => {
        const INDEX_ITEM = this.hours_selecteds.findIndex(
          (hour: any) => hour.day_name === day.day &&
            hour.hour === hours_day.hour &&
            hour.item.hour_start === item.hour_start &&
            hour.item.hour_end === item.hour_end
        );
        if (INDEX_ITEM !== -1) {
          this.hours_selecteds.splice(INDEX_ITEM, 1);
        }
        this.hours_selecteds.push({
          day,
          day_name: day.day,
          hours_day,
          hour: hours_day.hour,
          grupo: 'all',
          item
        });
      });
    }
  }

  addHourAllDay(event: any, hours_day: any) {
    const INDEX = this.hours_selecteds.findIndex((hour: any) => hour.hour === hours_day.hour);

    if (INDEX !== -1 && !event.currentTarget.checked) {
      this.days_week.forEach((day) => {
        hours_day.items.forEach((item: any) => {
          const INDEX_ITEM = this.hours_selecteds.findIndex((hour: any) => hour.day_name === day.day &&
            hour.hour === hours_day.hour &&
            hour.item.hour_start === item.hour_start &&
            hour.item.hour_end === item.hour_end);
          if (INDEX_ITEM !== -1) {
            this.hours_selecteds.splice(INDEX_ITEM, 1);
          }
        });
      });
    } else {
      this.days_week.forEach((day) => {
        hours_day.items.forEach((item: any) => {
          const INDEX_ITEM = this.hours_selecteds.findIndex((hour: any) => hour.day_name === day.day &&
            hour.hour === hours_day.hour &&
            hour.item.hour_start === item.hour_start &&
            hour.item.hour_end === item.hour_end);
          if (INDEX_ITEM !== -1) {
            this.hours_selecteds.splice(INDEX_ITEM, 1);
          }
        });
      });
      setTimeout(() => {
        this.days_week.forEach((day) => {
          this.addHourAll(hours_day, day);
        });
      }, 25);
    }
  }

  isCheckedHourAll(hours_day: any, day: any): boolean {
    const INDEX = this.hours_selecteds.findIndex(
      (hour: any) => hour.day_name === day.day &&
        hour.hour === hours_day.hour &&
        hour.grupo === 'all'
    );
    const COUNT_SELECTED = this.hours_selecteds.filter(
      (hour: any) => hour.day_name === day.day &&
        hour.hour === hours_day.hour
    ).length;
    return INDEX !== -1 && COUNT_SELECTED === hours_day.items.length;
  }

  isCheckedHour(hours_day: any, day: any, item: any): boolean {
    const INDEX = this.hours_selecteds.findIndex(
      (hour: any) => hour.day_name === day.day &&
        hour.hour === hours_day.hour &&
        hour.item.hour_start === item.hour_start &&
        hour.item.hour_end === item.hour_end
    );
    return INDEX !== -1;
  }

  get title(): string {
    return this.isEditMode ? `Editar Doctor ` : 'Agregar Doctor';
  }
}
