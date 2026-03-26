import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { routes } from 'src/app/shared/routes/routes';
import { PatientMService } from '../../../services/patient-m.service';
import { DoctorService } from '../../../services/doctor.service';
import { catchError, throwError } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-patient-form-m',
  templateUrl: './patient-form-m.component.html',
  styleUrls: ['./patient-form-m.component.scss']
})
export class PatientFormMComponent implements OnInit {
  public routes = routes;
  public patientForm: FormGroup;
  public isEditMode = false;
  public patientId: string | null = null;
  public doctor_id: any;
  public user: any;

  public FILE_AVATAR: any;
  public IMAGE_PREVISUALIZA: any = 'assets/img/user-06.jpg';

  public text_validation: string;
  public patient_selected: any;
  public isLoading = false;
  public isSaving = false;

  constructor(
    private fb: FormBuilder,
    public patientService: PatientMService,
    public doctorService: DoctorService,
    public router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.patientForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      phone: [''],
      email: [''],
      birth_date: [''],
      gender: [1],
      education: [''],
      address: [''],
      n_doc: ['', Validators.required],
      antecedent_personal: [''],
      antecedent_family: [''],
      antecedent_alerg: [''],
      name_companion: [''],
      surname_companion: [''],
      mobile_companion: [''],
      relationship_companion: [''],
      name_responsable: [''],
      surname_responsable: [''],
      mobile_responsable: [''],
      relationship_responsable: [''],
      ta: [0],
      temperature: [0],
      fc: [0],
      fr: [0],
      peso: [0],
      current_desease: ['']
    });
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.doctorService.closeMenuSidebar();
    const USER = localStorage.getItem("user");
    this.user = JSON.parse(USER || '{}');
    this.doctor_id = this.user.id;

    this.patientId = this.activatedRoute.snapshot.paramMap.get('id');
    console.log('DEBUG patient-form ngOnInit: route patientId =', this.patientId);
    console.log('DEBUG patient-form ngOnInit: isEditMode before =', this.isEditMode);
    if (this.patientId) {
      this.isEditMode = true;
      console.log('DEBUG patient-form ngOnInit: entering edit mode, id=', this.patientId);
      this.loadPatient();
    } else {
      console.log('DEBUG patient-form ngOnInit: create mode');
    }
  }

  loadPatient(): void {
    console.log('DEBUG patient-form loadPatient: calling getPatient(', +this.patientId!, ')');
    this.isLoading = true;
    this.patientService.getPatient(+this.patientId!).pipe(
      catchError(err => {
        console.error('DEBUG patient-form loadPatient ERROR:', err);
        this.text_validation = 'Error loading patient: ' + (err.error?.message || err.message);
        this.isEditMode = false; // Fallback to create if load fails
        this.isLoading = false;
        return throwError(() => err);
      })
    ).subscribe((resp: any) => {
      console.log('DEBUG patient-form loadPatient SUCCESS:', resp);
      this.patient_selected = resp.patient;
      this.patientForm.patchValue({
        name: this.patient_selected.name,
        surname: this.patient_selected.surname,
        phone: this.patient_selected.phone,
        email: this.patient_selected.email || '',
        birth_date: this.patient_selected.birth_date ? new Date(this.patient_selected.birth_date).toISOString().slice(0,10) : '',
        education: this.patient_selected.education || '',
        gender: this.patient_selected.gender,
        address: this.patient_selected.address || '',
        n_doc: this.patient_selected.n_doc || '',
        antecedent_personal: this.patient_selected.antecedent_personal || '',
        antecedent_family: this.patient_selected.antecedent_family || '',
        antecedent_alerg: this.patient_selected.antecedent_alerg || '',
        current_desease: this.patient_selected.current_desease || '',
        ta: this.patient_selected.ta || 0,
        fc: this.patient_selected.fc || 0,
        fr: this.patient_selected.fr || 0,
        peso: this.patient_selected.peso || 0,
        temperature: this.patient_selected.temperature || 0
      });
      // Companions from person
      this.patientForm.patchValue({
        name_companion: this.patient_selected.person?.name_companion || '',
        surname_companion: this.patient_selected.person?.surname_companion || '',
        mobile_companion: this.patient_selected.person?.mobile_companion || '',
        relationship_companion: this.patient_selected.person?.relationship_companion || '',
        name_responsable: this.patient_selected.person?.name_responsable || '',
        surname_responsable: this.patient_selected.person?.surname_responsable || '',
        mobile_responsable: this.patient_selected.person?.mobile_responsable || '',
        relationship_responsable: this.patient_selected.person?.relationship_responsable || ''
      });
      this.IMAGE_PREVISUALIZA = this.patient_selected.avatar || 'assets/img/user-06.jpg';
      this.isLoading = false;
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
    reader.onloadend = () => this.IMAGE_PREVISUALIZA = reader.result;
  }

  // eslint-disable-next-line no-debugger
  save(): void {
    console.log('DEBUG patient-form save(): isEditMode=', this.isEditMode, 'patientId=', this.patientId);
    if (this.isSaving || this.isLoading) {
      console.log('DEBUG save(): already saving/loading, ignore');
      return;
    }
    this.isSaving = true;
    this.isLoading = true;
    if (this.patientForm.invalid) {
      this.text_validation = 'Los campos con * son obligatorios';
      this.isSaving = false;
      this.isLoading = false;
      return;
    }

    const formData = new FormData();
    const formValue = this.patientForm.value;

    // Append all fields (optional skipped if empty as per original)
    formData.append('name', formValue.name);
    formData.append('surname', formValue.surname);
    formData.append('phone', formValue.phone || '');
    formData.append('gender', formValue.gender.toString());
    formData.append('address', formValue.address || '');
    formData.append('n_doc', formValue.n_doc);
    formData.append('doctor_id', this.doctor_id.toString());

    // Optional vitals
    ['ta', 'fc', 'fr', 'peso', 'temperature'].forEach(field => {
      const val = formValue[field];
      if (val && val !== 0) {
        formData.append(field, val.toString());
      }
    });

    // Optional others
    ['role_id', 'antecedent_personal', 'antecedent_family', 'antecedent_alerg',
     'name_companion', 'surname_companion', 'mobile_companion', 'relationship_companion',
     'name_responsable', 'surname_responsable', 'mobile_responsable', 'relationship_responsable',
     'current_desease', 'education', 'birth_date', 'email'].forEach(field => {
      const val = formValue[field];
      if (val) {
        formData.append(field, val);
      }
    });

    if (this.FILE_AVATAR) {
      formData.append('imagen', this.FILE_AVATAR);
    }

    this.text_validation = '';


    let observable = this.isEditMode
      ? this.patientService.editPatient(formData, +this.patientId!)
      : this.patientService.createPatient(formData);
    
    observable = observable.pipe(
      catchError((err: any) => {
        console.error('DEBUG patient-form save ERROR:', err, 'isEditMode:', this.isEditMode);
        this.text_validation = err.error?.message_text || err.error?.message || 'Error saving patient';
        this.isLoading = false;
        this.isSaving = false;
        return throwError(() => err);
      })
    );
    
    observable.subscribe((resp: any) => {
      console.log('DEBUG patient-form save SUCCESS:', resp);
      if (resp.message === 403) {
        this.text_validation = resp.message_text;
      } else {
        this.isLoading = false;
        this.isSaving = false;
        Swal.fire('Exito!', `El Paciente se ha ${this.isEditMode ? 'Actualizado' : 'Creado'}`, 'success');
        // this.router.navigate(['/patient-m/list/doctor/', this.doctor_id]);
      }
    });
  }

  public get title(): string {
    return this.isEditMode ? `Editar Paciente #${this.patientId}` : 'Agregar Paciente';
  }
}
