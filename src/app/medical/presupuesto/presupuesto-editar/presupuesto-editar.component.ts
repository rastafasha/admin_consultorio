import { Component, NgZone } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { LaboratoryService } from '../../../services/laboratory.service';
import { PresupuestoService } from '../../../services/presupuesto.service';
import { DoctorService } from '../../../services/doctor.service';
import { SpecialitieService } from '../../../services/specialitie.service';
import { RolesService } from '../../../services/roles.service';
import { AppointmentService } from '../../../services/appointment.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Patient } from '../../../models/patient.model';
import { Doctor, Speciality } from '../../../models/presupuesto.model';
import { AuthService } from '../../../shared/auth/auth.service';
import { routes } from '../../../shared/routes/routes';
declare let $: any;

@Component({
  selector: 'app-presupuesto-editar',
  templateUrl: './presupuesto-editar.component.html',
  styleUrls: ['./presupuesto-editar.component.scss'],
  standalone: false
})
export class PresupuestoEditarComponent {

  public routes = routes;
  public presupuestoForm: FormGroup;
  titlePage: string;
  valid_form_success = false;
  public text_validation = '';
  public text_success = '';

  pageTitle = 'Presupuesto';
  isediting = false;
  isdisabled = false;
  isdoctor = false;
  name = '';
  surname = '';
  n_doc: number;
  phone = '';
  email = '';



  laboratory = false;
  laboratory_number = 1;

  public medical: any = []; // Ensure medical is initialized as an array
  description: any;
  name_medical: any;
  precio: number = 0;
  cantidad: number = 0;
  total: number = 0;
  amount = 0;

  presupuesto_id: number;
  speciality_id: number;
  presupuesto_selected: any;
  appointment_atention_selected: string;
  diagnostico: string;
  specialityName: string;
  isLoading = false;

  antecedent_alerg: any;

  public file_selected: any;
  public doc: any;
  public user: any;

  patient: Patient[];
  patient_id: Patient;
  doctor: Doctor[];
  doctor_id: number;
  speciality: Speciality[];
  specialities: Speciality[];
  DOCTOR_SELECTED: any;
  presupuestoSeleccionado: any;

  // dictado
  recognition: any;
  isListening: boolean = false;
  campoActual: 'description' | 'name_medical' | 'cantidad' | 'precio' | 'diagnostico' = 'description';




  id = 0;

  info_crear_presupuesto = `
  <p>En esta sección :</p>
          <ul>
            <li><strong>Paciente:</strong> Búscalo por cédula para autorellenar sus datos. Usa <em>Reset</em> para limpiar la búsqueda.</li>
            <li><strong>Presupuesto:</strong> Añade ítems, cantidades y precios; el sistema calculará los subtotales y el total automáticamente.</li>
            <li><strong>App del Paciente:</strong> Al presionar <em>Guardar</em>, el presupuesto se sincronizará de inmediato en la app de tu paciente para su consulta.</li>
            <li>
              <strong>Comandos de voz:</strong>
              <br>• <em>Navegación:</em> "pasar a descripción", "pasar a diagnóstico", "pasar a ítem", "pasar a cantidad", "pasar a precio".
              <br>• <em>Acciones:</em> "agregar ítem" (o "agregar"), "guardar presupuesto" (o "guardar").
              <br>• <em>Edición:</em> "limpiar todo", "punto y aparte", "punto y seguido".
            </li>
          </ul>`;

  constructor(
    public presupuestoService: PresupuestoService,
    public laboratoryService: LaboratoryService,
    public authService: AuthService,
    public router: Router,
    public ativatedRoute: ActivatedRoute,
    public doctorService: DoctorService,
    public specialitiService: SpecialitieService,
    public roleService: RolesService,
    public appointmentService: AppointmentService,
    public fb: FormBuilder,
    private zone: NgZone
  ) {
    this.user = this.authService.user;
  }

  ngOnInit(): void {
    this.isediting = false;
    this.isdisabled = false;
    this.isdoctor = false;
    window.scrollTo(0, 0);

    const USER = localStorage.getItem("user");
    this.user = JSON.parse(USER ? USER : '');
    this.user = this.roleService.authService.user;
    this.doctor_id = this.user.id;

    if (this.user.roles[0] === 'DOCTOR') {
      this.isdoctor = true;
      this.isdisabled = false;
    }
    // this.ativatedRoute.params.subscribe( ({id}) => this.cargarPresupuesto(id));
    this.ativatedRoute.params.subscribe((resp: any) => {
      this.presupuesto_id = resp.id;
      // this.cargarPresupuesto();
      if (this.presupuesto_id) {
        this.getPresupuesto();
        this.titlePage = 'Editando Presupuesto';
        this.isediting = true;
        if (this.isediting === true) {
          this.isdisabled = true;
        }
      } else {
        this.isediting = false;
        this.titlePage = 'Crear Presupuesto';
      }
    })
    this.getDoctor();
    this.getSpecialities();
    this.initSpeechRecognition();

  }

  getPresupuesto() {
    this.isLoading = true;
    this.presupuestoService.getPresupuesto(this.presupuesto_id).subscribe((resp: any) => {
      this.presupuesto_selected = resp;
      // console.log(this.presupuesto_selected);
      this.patient = this.presupuesto_selected.patient;
      this.patient_id = this.presupuesto_selected.patient.id;
      this.n_doc = this.presupuesto_selected.patient.n_doc;
      this.name = this.presupuesto_selected.patient.name;
      this.surname = this.presupuesto_selected.patient.surname;
      this.email = this.presupuesto_selected.patient.email;
      this.patient = this.presupuesto_selected.patient.patient;
      this.phone = this.presupuesto_selected.patient.phone;
      this.description = this.presupuesto_selected.description;
      this.diagnostico = this.presupuesto_selected.diagnostico;
      this.doctor = this.presupuesto_selected.doctor.full_name;
      this.speciality_id = this.presupuesto_selected.speciality_id;
      this.amount = this.presupuesto_selected.amount;
      this.medical = this.presupuesto_selected.medical;
      this.isLoading = false;

    });
  }

  validarFormulario() {
    this.presupuestoForm = this.fb.group({
      name: [''],
      surname: [''],
      n_doc: [''],
      phone: [''],
      name_medical: [''],
      description: [''],
      diagnostico: [''],
      amount: [''],
      // hour:[''],
      speciality_id: [''],
      patient_id: [''],
      doctor_id: [''],
    })
  }

  initSpeechRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error('El dictado por voz no es soportado.');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.lang = 'es-VE';

    this.recognition.onresult = (event: any) => {
      if (!event || !event.results) return;

      const currentResultIndex = event.resultIndex;
      const result = event.results[currentResultIndex];

      if (!result || !result[0] || !result[0].transcript) return;

      const rawText = result[0].transcript;
      console.log('Texto crudo recibido:', rawText);

      let textoEvaluar = rawText.toLowerCase().trim();
      if (textoEvaluar.endsWith('.')) {
        textoEvaluar = textoEvaluar.slice(0, -1).trim();
      }

      // ==========================================
      // 1. SECCIÓN DE COMANDOS DE NAVEGACIÓN
      // ==========================================

      // Primero evaluamos las frases largas y específicas de navegación
      if (textoEvaluar.includes('pasar a descripción') || textoEvaluar.includes('ir a descripción')) {
        this.zone.run(() => { this.campoActual = 'description'; });
        return;
      }

      if (textoEvaluar.includes('pasar a diagnóstico') || textoEvaluar.includes('ir a diagnóstico')) {
        this.zone.run(() => { this.campoActual = 'diagnostico'; });
        return;
      }

      // Para cambiar de campo, exigimos la palabra "pasar a" o "ir a" 
      // Así evitamos que se active el comando si solo estás dictando un valor numérico o un nombre.
      if (textoEvaluar.includes('pasar a ítem') || textoEvaluar.includes('pasar a item') || textoEvaluar.includes('ir a ítem') || textoEvaluar.includes('ir a item')) {
        this.zone.run(() => { this.campoActual = 'name_medical'; });
        return;
      }

      if (textoEvaluar.includes('pasar a cantidad') || textoEvaluar.includes('ir a cantidad')) {
        this.zone.run(() => { this.campoActual = 'cantidad'; });
        return;
      }

      if (textoEvaluar.includes('pasar a precio') || textoEvaluar.includes('ir a precio')) {
        this.zone.run(() => { this.campoActual = 'precio'; });
        return;
      }

      // 🔥 COMANDO AGREGAR: Añadimos más variantes con y sin tilde para mayor seguridad
      if (
        textoEvaluar.includes('agregar ítem') ||
        textoEvaluar.includes('agregar item') ||
        textoEvaluar.includes('añadir ítem') ||
        textoEvaluar.includes('añadir item') ||
        textoEvaluar === 'agregar' ||
        textoEvaluar === 'añadir'
      ) {
        this.zone.run(() => {
          this.addItemPresupuesto(); // Llama a tu función que calcula el amount correcto
          this.name_medical = '';
          this.cantidad = 0;
          this.precio = 0;
          this.campoActual = 'name_medical'; // Regresa el foco al inicio del flujo
        });
        return;
      }

      // 🔥 COMANDO GUARDAR: Evaluamos frases completas primero para evitar falsos positivos
      if (textoEvaluar.includes('guardar presupuesto') || textoEvaluar.includes('finalizar presupuesto') || textoEvaluar === 'guardar') {
        this.zone.run(() => {
          this.save();
        });
        return;
      }


      // ==========================================
      // 2. SECCIÓN DE ESCRITURA CON NGZONE
      // ==========================================
      this.zone.run(() => {

        // SI ESTÁ EN EL CAMPO description
        if (this.campoActual === 'description') {
          if (textoEvaluar.includes('limpiar todo') || textoEvaluar.includes('borrar todo')) {
            this.description = '';
            return;
          }
          if (textoEvaluar.includes('punto y aparte')) {
            this.description = this.description ? `${this.description.trim()}.\n\n` : '';
            return;
          }
          if (textoEvaluar.includes('punto y seguido')) {
            this.description = this.description ? `${this.description.trim()}. ` : '';
            return;
          }

          let textoFinal = rawText.trim();
          if (!this.description || this.description.endsWith('\n') || this.description.endsWith('. ')) {
            textoFinal = textoFinal.charAt(0).toUpperCase() + textoFinal.slice(1);
          }

          this.description = this.description
            ? (this.description.endsWith('\n') || this.description.endsWith(' ') ? this.description + textoFinal : this.description + ' ' + textoFinal)
            : textoFinal;
        }
        // SI ESTÁ EN EL CAMPO DIAGNÓSTICO
        if (this.campoActual === 'diagnostico') {
          if (textoEvaluar.includes('limpiar todo') || textoEvaluar.includes('borrar todo')) {
            this.diagnostico = '';
            return;
          }
          if (textoEvaluar.includes('punto y aparte')) {
            this.diagnostico = this.diagnostico ? `${this.diagnostico.trim()}.\n\n` : '';
            return;
          }
          if (textoEvaluar.includes('punto y seguido')) {
            this.diagnostico = this.diagnostico ? `${this.diagnostico.trim()}. ` : '';
            return;
          }

          let textoFinal = rawText.trim();
          if (!this.diagnostico || this.diagnostico.endsWith('\n') || this.diagnostico.endsWith('. ')) {
            textoFinal = textoFinal.charAt(0).toUpperCase() + textoFinal.slice(1);
          }

          this.diagnostico = this.diagnostico
            ? (this.diagnostico.endsWith('\n') || this.diagnostico.endsWith(' ') ? this.diagnostico + textoFinal : this.diagnostico + ' ' + textoFinal)
            : textoFinal;
        }

        // SI ESTÁ EN EL NOMBRE DEL MEDICAMENTO
        else if (this.campoActual === 'name_medical') {
          let textoFinal = rawText.trim();
          // Capitaliza el nombre del medicamento (Ej: "Ibuprofeno")
          textoFinal = textoFinal.charAt(0).toUpperCase() + textoFinal.slice(1);

          this.name_medical = this.name_medical ? `${this.name_medical.trim()} ${textoFinal}` : textoFinal;
        }

        // SI ESTÁ EN EL precio DEL MEDICAMENTO
        else if (this.campoActual === 'precio') {
          this.precio = this.precio ? `${this.precio} ${rawText.trim()}` : rawText.trim();
        }

        else if (this.campoActual === 'cantidad') {
          this.cantidad = this.cantidad ? `${this.cantidad} ${rawText.trim()}` : rawText.trim();
        }


      });
    };

    this.recognition.onerror = (event: any) => {
      console.error('Error en el dictado:', event.error);
    };
  }

  // Mantenemos la función de ayuda para el diagnóstico
  actualizarTexto(valor: string, campo: string, monto: number) {
    this.zone.run(() => {
      if (campo === 'description') {
        this.description = valor;
      } else if (campo === 'diagnostico') {
        this.diagnostico = valor;
      } else if (campo === 'name_medical') {
        this.name_medical = valor;
      } else if (campo === 'cantidad') {
        this.cantidad = monto;
      } else if (campo === 'precio') {
        this.precio = monto;
      }
    });
  }

  toggleDictado(event: any) {
    this.isListening = event.target.checked;

    if (!this.recognition) {
      alert('Tu navegador no soporta dictado por voz.');
      return;
    }

    if (this.isListening) {
      this.recognition.start();
    } else {
      this.recognition.stop();
    }
  }



  getSpecialities() {
    this.presupuestoService.listConfig().subscribe((resp: any) => {
      this.specialities = resp.specialities;
    })
  }

  getDoctor() {
    this.isLoading = true
    this.doctorService.showDoctor(this.doctor_id).subscribe((resp: any) => {
      this.DOCTOR_SELECTED = resp.user;
      this.speciality_id = this.DOCTOR_SELECTED.speciality_id;

      this.speciality_id = this.DOCTOR_SELECTED.speciality_id;
      this.specialitiService.showSpeciality(this.speciality_id).subscribe((resp: any) => {
        this.specialityName = resp.name
      })
      this.isLoading = false
    })
  }

  filterPatient() {
    this.appointmentService.getPatient(this.n_doc + "").subscribe((resp: any) => {
      // console.log(resp);
      this.patient = resp;
      if (resp.menssage === 403) {
        this.name = '';
        this.surname = '';
        this.phone = '';
        this.email = '';
        this.n_doc = 0;
      } else {
        this.name = resp.name;
        this.surname = resp.surname;
        this.email = resp.email;
        this.phone = resp.phone + '';
        this.n_doc = resp.n_doc;
      }
    })
  }

  resetPatient() {
    this.name = '';
    this.surname = '';
    this.email = '';
    this.phone = '';
    this.n_doc = 0;
  }

  addItemPresupuesto() {
    if (this.name_medical && this.precio > 0) {
      this.medical.push({
        name_medical: this.name_medical,
        cantidad: this.cantidad + '',
        precio: this.precio + ''
      });

      // Limpiamos el formulario temporal
      this.name_medical = '';
      this.precio = 0;
      this.cantidad = 0;
    }

    // 🔥 Recalculamos el total general usando la función unificada
    this.recalcularTotalPresupuesto();
  }

  deleteItemPresupuesto(i: any) {
    // 1. Eliminamos el ítem seleccionado del array
    this.medical.splice(i, 1);

    // 2. Limpiamos los campos de texto del formulario temporal
    this.name_medical = '';
    this.precio = 0;
    this.cantidad = 0;

    // 3. 🔥 Recalculamos el total con la variable correcta
    this.recalcularTotalPresupuesto();
  }

  // Función ayudante unificada que actualiza la variable exacta (this.amount)
  private recalcularTotalPresupuesto() {
    this.amount = this.medical.reduce((acumulado: number, item: any) => {
      return acumulado + (Number(item.precio) * Number(item.cantidad));
    }, 0);
  }





  save() {
    const data = {

      medical: this.medical,
      amount: this.amount,
      description: this.description,
      diagnostico: this.diagnostico,

      patient_id: this.patient_id,
      name: this.name,
      email: this.email,
      n_doc: this.n_doc,
      surname: this.surname,
      phone: this.phone,

      speciality_id: this.DOCTOR_SELECTED.speciality_id,
      presupuesto_id: this.presupuesto_id,
      doctor_id: this.DOCTOR_SELECTED.id,

      // ...this.atentionForm.value,


    }



    if (this.presupuesto_id) {
      this.presupuestoService.editPresupuesto(data, this.presupuesto_id).subscribe((resp: any) => {
        console.log(data);
        if (resp.message == 403) {
          this.text_validation = resp.message_text;
          Swal.fire({
            position: "top-end",
            icon: "warning",
            title: this.text_validation,
            showConfirmButton: false,
            timer: 1500
          });
        } else {
          this.text_success = 'Se guardó la informacion del Laboratorio con la cita'
          Swal.fire({
            position: "top-end",
            icon: "success",
            title: this.text_success,
            showConfirmButton: false,
            timer: 1500
          });
          if (this.user.roles[0] === 'DOCTOR') {
            this.router.navigate(['/presupuesto/list/doctor']);
          } else {

            this.router.navigate(['/presupuesto/list']);
          }
        }
      })
    } else {
      console.log('Creating new presupuesto with data:', data);
      this.presupuestoService.createPresupuesto(data).subscribe((resp: any) => {
        if (resp.message == 403) {
          this.text_validation = resp.message_text;
          Swal.fire({
            position: "top-end",
            icon: "warning",
            title: this.text_validation,
            showConfirmButton: false,
            timer: 1500
          });
        } else {
          this.text_success = 'Se guardó la informacion del Laboratorio con la cita'
          Swal.fire({
            position: "top-end",
            icon: "success",
            title: this.text_success,
            showConfirmButton: false,
            timer: 1500
          });
          if (this.user.roles[0] === 'DOCTOR') {
            this.router.navigate(['/presupuesto/list/doctor']);
          } else {

            this.router.navigate(['/presupuesto/list']);
          }
        }
      })
    }
  }
}
