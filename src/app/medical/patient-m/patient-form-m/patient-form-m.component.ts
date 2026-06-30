import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PatientMService } from '../../../services/patient-m.service';
import { DoctorService } from '../../../services/doctor.service';
import { catchError, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { routes } from '../../../shared/routes/routes';
import { StaffService } from '../../../services/staff.service';
import { EvolucionComponent } from '../components/evolucion/evolucion.component';
import { VacunasComponent } from '../components/vacunas/vacunas.component';
import { ReporteLaboratorioComponent } from '../components/reporte-laboratorio/reporte-laboratorio.component';

@Component({
  selector: 'app-patient-form-m',
  templateUrl: './patient-form-m.component.html',
  styleUrls: ['./patient-form-m.component.scss'],
  standalone: false
})
export class PatientFormMComponent implements OnInit {

  // 🔌 Conectamos los cables hacia el interior de los componentes hijos
  @ViewChild('componenteVacunas') vacunasHijo!: VacunasComponent;
  @ViewChild('componenteEvolucion') evolucionHijo!: EvolucionComponent;
  @ViewChild('reporteLaboratory') reporteHijo!: ReporteLaboratorioComponent;

  
  public routes = routes;
  public patientForm: FormGroup;
  public isEditMode = false;
  public patientId: string | null = null;
  public doctor_id: any;
  public user: any;
  pacienteExiste: boolean = false;

  public FILE_AVATAR: any;
  public IMAGE_PREVISUALIZA: any = 'assets/img/user-06.jpg';

  public text_validation: string;
  public patient_selected: any;
  public isLoading = false;
  public isSaving = false;
  doctor: string;

  public mvacunas: any = []; // Ensure medical is initialized as an array
  public mevolucion: any = []; // Ensure medical is initialized as an array

  info_form_paciente = `
  <p>En esta sección :</p>
          <ul>
            <li>Podrás llenar la ficha médica de tu paciente</li>
            <li>Información Básica, de contacto, persona de contacto o familiar</li>
            <li>Es Recomendable llenar la sección de Signos Vitales para tener un control del estado de salud</li>
            <li>Con Signos Vitales esto podrá ayudar a la aplicación a futuro para mostrar un comportamiento y reportes presentados en la App  </li>
          </ul>`;

  constructor(
    private fb: FormBuilder,
    public patientService: PatientMService,
    public doctorService: DoctorService,
    public router: Router,
    private activatedRoute: ActivatedRoute,
    private staffService: StaffService,
    private cd: ChangeDetectorRef
  ) {

  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.validarFormulario()
    this.doctorService.closeMenuSidebar();
    const USER = localStorage.getItem("user");
    this.user = JSON.parse(USER || '{}');
    this.doctor_id = this.user.id;
    this.getUserRemoto()

    this.patientId = this.activatedRoute.snapshot.paramMap.get('id');
    // console.log('DEBUG patient-form ngOnInit: route patientId =', this.patientId);
    // console.log('DEBUG patient-form ngOnInit: isEditMode before =', this.isEditMode);
    if (this.patientId) {
      this.isEditMode = true;
      // console.log('DEBUG patient-form ngOnInit: entering edit mode, id=', this.patientId);
      this.loadPatient();
    } else {
      console.log('DEBUG patient-form ngOnInit: create mode');
    }
  }

  getUserRemoto(): void {
    if (!this.user?.id) return;
    this.staffService.getUser(this.user.id).subscribe((resp: any) => {
      this.doctor = resp.user;
    });
  }

  validarFormulario() {
    this.patientForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      phone: ['', Validators.required],
      email: [''],
      birth_date: [''],
      gender: [1],
      education: [''],
      address: [''],
      talla: [''],
      historia_enfermedad: [''],
      enfermedad_actual: [''],
      tratamiento: [''],
      examen_fisico: [''],
      reporte_laboratorio: [''],
      evolucion: [''],
      vacunas: [''],
      peso_al_nacer: [''],
      talla_al_nacer: [''],
      n_doc: ['', [Validators.required, Validators.minLength(3)]],
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



  verificarPaciente(event: any): void {
    const documento = event.target.value?.trim();
    const control = this.patientForm.get('n_doc');

    // 1. Si está vacío o tiene menos de 3 caracteres, limpiamos el error 'yaExiste'
    // y dejamos que Angular ejecute sus validadores nativos normales.
    if (!documento || documento.length < 3) {
      this.pacienteExiste = false;
      if (control?.hasError('yaExiste')) {
        delete control.errors?.['yaExiste'];
        control.updateValueAndValidity(); // 👈 Fuerza a Angular a recalcular required/minlength
      }
      return;
    }

    // 2. Consultamos al backend si pasa los filtros básicos
    this.patientService.buscarPorDocumento(documento).subscribe({
      next: (res: any) => {
        const control = this.patientForm.get('n_doc');

        if (res && res.existe) {
          this.pacienteExiste = true;

          // Conservamos errores previos y sumamos 'yaExiste'
          const erroresActuales = control?.errors || {};
          control?.setErrors({ ...erroresActuales, yaExiste: true });

          // CORREGIDO: Usamos onlySelf en lugar del error de tipeo
          control?.markAsTouched({ onlySelf: true });
          control?.markAsDirty();
        } else {
          this.pacienteExiste = false;
          if (control?.errors) {
            delete control.errors['yaExiste'];
            if (Object.keys(control.errors).length === 0) {
              control.setErrors(null);
            } else {
              control.setErrors(control.errors);
            }
          }
        }

        // Recalculamos validez y forzamos el renderizado visual en la pantalla
        control?.updateValueAndValidity({ emitEvent: true });
        this.patientForm.updateValueAndValidity();
        this.cd.detectChanges(); // 👈 LA LÍNEA MÁGICA: Fuerza a Angular a pintar el HTML ya mismo
      },
      error: (err) => {
        console.error("Error al verificar el documento", err);
      }
    });
  }

  loadPatient(): void {
    console.log('DEBUG patient-form loadPatient: calling getPatient(', +this.patientId!, ')');
    this.isLoading = true;
    this.patientService.getPatient(+this.patientId!).pipe(
      catchError(err => {
        // console.error('DEBUG patient-form loadPatient ERROR:', err);
        this.text_validation = 'Error loading patient: ' + (err.error?.message || err.message);
        this.isEditMode = false; // Fallback to create if load fails
        this.isLoading = false;
        return throwError(() => err);
      })
    ).subscribe((resp: any) => {
      // console.log('DEBUG patient-form loadPatient SUCCESS:', resp);
      this.patient_selected = resp.patient;
      this.patientForm.patchValue({
        name: this.patient_selected.name,
        surname: this.patient_selected.surname,
        phone: this.patient_selected.phone,
        email: this.patient_selected.email || '',
        birth_date: this.patient_selected.birth_date ? new Date(this.patient_selected.birth_date).toISOString().slice(0, 10) : '',
        education: this.patient_selected.education || '',
        gender: this.patient_selected.gender || 0,
        address: this.patient_selected.address || '',
        n_doc: this.patient_selected.n_doc || '',
        antecedent_personal: this.patient_selected.antecedent_personal || '',
        antecedent_family: this.patient_selected.antecedent_family || '',
        antecedent_alerg: this.patient_selected.antecedent_alerg || '',
        current_desease: this.patient_selected.current_desease || '',
        ta: this.patient_selected.ta || 0,
        fc: this.patient_selected.fc || 0,
        fr: this.patient_selected.fr || 0,
        temperature: this.patient_selected.temperature || 0,
        peso: this.patient_selected.peso || 0,
        talla: this.patient_selected.talla || 0,
        talla_al_nacer: this.patient_selected.talla_al_nacer || 0,
        peso_al_nacer: this.patient_selected.peso_al_nacer || 0,
        tratamiento: this.patient_selected.tratamiento || '',
        historia_enfermedad: this.patient_selected.historia_enfermedad ||'',
        examen_fisico: this.patient_selected.examen_fisico || '',
        enfermedad_actual: this.patient_selected.enfermedad_actual || '',
        // Sincronizamos las llaves del formulario reactivo con los datos del backend
        vacunas: this.patient_selected.vacunas || [],
        evolucion: this.patient_selected.evolucion || [],
        reporte_laboratorio: this.patient_selected.reporte_laboratorio || []
      });
      // 2. 💥 LA MAGIA: Le llenamos el array local a los hijos y forzamos el redibujado de sus tablas
    // Usamos setTimeout para darle un milisegundo a Angular de procesar el renderizado
    setTimeout(() => {
      if (this.vacunasHijo && this.patient_selected.vacunas) {
        this.vacunasHijo.mvacunas = [...this.patient_selected.vacunas];
      }
      
      if (this.evolucionHijo && this.patient_selected.evolucion) {
        this.evolucionHijo.mevolucion = [...this.patient_selected.evolucion];
      }
      if (this.reporteHijo && this.patient_selected.reporte_laboratorio) {
        this.evolucionHijo.mevolucion = [...this.patient_selected.reporte_laboratorio];
      }
    }, 50);
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
    if (!this.patientForm.valid) {
      //mostramos las alertas de los campos requeridos
      this.patientForm.markAllAsTouched(); // Esto activa las validaciones visuales
      return
    }

    // console.log('DEBUG patient-form save(): isEditMode=', this.isEditMode, 'patientId=', this.patientId);
    if (this.isSaving || this.isLoading) {
      // console.log('DEBUG save(): already saving/loading, ignore');
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
    formData.append('talla', formValue.talla);
    formData.append('historia_enfermedad', formValue.historia_enfermedad);
    formData.append('enfermedad_actual', formValue.enfermedad_actual);
    formData.append('tratamiento', formValue.tratamiento);
    formData.append('examen_fisico', formValue.examen_fisico);
    formData.append('reporte_laboratorio', formValue.reporte_laboratorio);
    formData.append('peso_al_nacer', formValue.peso_al_nacer);
    formData.append('talla_al_nacer', formValue.talla_al_nacer);
    formData.append('doctor_id', this.doctor_id.toString());
    // (Usamos un fallback de arreglo vacío [] por si el componente no se renderizó)
    const listaVacunas = this.patientForm.get('vacunas')?.value || [];
    const listaEvoluciones = this.patientForm.get('evolucion')?.value || [];

    // 2. 🛡️ SERIALIZACIÓN CRÍTICA: Convertimos los arrays a texto estructurado JSON
    formData.append('vacunas', JSON.stringify(listaVacunas));
    formData.append('evolucion', JSON.stringify(listaEvoluciones));

    // 3. Adjuntar el resto de campos normales de tu formulario
    // Recorremos todos los controles del formulario para meterlos al FormData de un solo golpe
    Object.keys(this.patientForm.controls).forEach(key => {
      // Evitamos duplicar vacunas y evoluciones en texto plano
      if (key !== 'vacunas' && key !== 'evolucion') {
        const value = this.patientForm.get(key)?.value;
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      }
    });


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
