import { ChangeDetectorRef, Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PatientMService } from '../../../services/patient-m.service';
import { DoctorService } from '../../../services/doctor.service';
import { catchError, Subscription, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { routes } from '../../../shared/routes/routes';
import { StaffService } from '../../../services/staff.service';
import { EvolucionComponent } from '../components/evolucion/evolucion.component';
import { VacunasComponent } from '../components/vacunas/vacunas.component';
import { ReporteLaboratorioComponent } from '../components/reporte-laboratorio/reporte-laboratorio.component';
import { SpeechRecognitionService } from '../../../services/speech-recognition.service';

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

  @ViewChild('inputMotivo') inputMotivo!: ElementRef;
  @ViewChild('compAntecedentes') compAntecedentes!: any;
  @ViewChild('compEnfermedad') compEnfermedad!: any;
  @ViewChild('compExamen') compExamen!: any;
  @ViewChild('compDiagnostico') compDiagnostico!: any;
  @ViewChild('compTratamiento') compTratamiento!: any;



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
  public is_vacuna = false || 1;

  doctor: string;

  public mvacunas: any = []; // Ensure medical is initialized as an array
  public mevolucion: any = []; // Ensure medical is initialized as an array


  // dictado
  recognition: any;
  isListening: boolean = false;
  campoActual: 'current_desease' | 'antecedent_personal' | 'antecedent_family' | 'antecedent_alerg' | 'enfermedad_actual' | 'examen_fisico' | 'tratamiento' | 'diagnostico' | 'name_medical' |
    'fecha_vacuna' | 'cantidad' | 'name_evolucion' | 'fecha_evolucion' = 'current_desease';
  current_desease: string = '';
  antecedent_personal: string = '';
  antecedent_family: string = '';
  antecedent_alerg: string = '';
  enfermedad_actual: string = '';
  examen_fisico: string = '';
  diagnostico: string = '';
  tratamiento: string = '';
  name_medical: string = '';
  fecha_vacuna: any;
  cantidad: number = 0;
  name_evolucion: string = '';
  fecha_evolucion: any;

  info_form_paciente = `
  <p>En esta sección :</p>
          <ul>
  <li><strong>Ficha Médica:</strong> Registra la información básica, datos de contacto y familiares del paciente.</li>
  <li><strong>Signos Vitales:</strong> Llenar esta sección permite al sistema generar gráficos de comportamiento y reportes automáticos en la App del Paciente.</li>
  <li>
    <strong>Comandos de voz:</strong>
    <br>• <em>Navegación:</em> "pasar a motivo consulta", "pasar a personales", "pasar a familiares", "pasar a alergias", "pasar a enfermedad actual", "pasar a examen", "pasar a diagnóstico", "pasar a tratamiento", "pasar a vacunas", "pasar a fecha de vacuna ó fecha de vacuna", "pasar a cantidad de vacuna", "agregar vacuna" , "pasar a evolución", "pasar a fecha de evolución ó fecha de evolución", "agregar evolución".
    <br>• <em>Acciones:</em> "guardar historia" (o "guardar"), "limpiar todo", "punto y aparte", "punto y seguido".
  </li>
</ul>

`;

  constructor(
    private fb: FormBuilder,
    public patientService: PatientMService,
    public doctorService: DoctorService,
    public router: Router,
    private activatedRoute: ActivatedRoute,
    private staffService: StaffService,
    private cd: ChangeDetectorRef,
    private speechService: SpeechRecognitionService,
    private zone: NgZone
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

    this.initSpeechRecognition();
  }

  toggleDictadoGlobal(event: any) {
    this.isListening = event.target.checked;
    if (!this.recognition) {
      alert('Tu navegador no soporta dictado por voz.');
      return;
    }
    if (this.isListening) {
      this.recognition.start();
      console.log('🎤 Micrófono encendido globalmente...');
    } else {
      this.recognition.stop();
      console.log('🛑 Micrófono apagado.');
    }
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
      console.log('🎙️ KLYNTIC VOICE RECEIVER:', rawText);

      let textoEvaluar = rawText.toLowerCase().trim();
      if (textoEvaluar.endsWith('.')) {
        textoEvaluar = textoEvaluar.slice(0, -1).trim();
      }



      // =========================================================================
      // 🚀 1. SECCIÓN DE COMANDOS DE NAVEGACIÓN EN EL HISTORIAL
      // =========================================================================

      if (textoEvaluar.includes('pasar a motivo consulta') || textoEvaluar.includes('ir a motivo consulta')) {
        this.zone.run(() => {
          this.campoActual = 'current_desease';

          // 🔥 Idéntico a presupuesto: Foco directo con el micro-retraso
          setTimeout(() => {
            if (this.inputMotivo) {
              this.inputMotivo.nativeElement.focus();
            }
          }, 50);
        });
        return;
      }

      if (textoEvaluar.includes('pasar a personales') || textoEvaluar.includes('ir a personales')) {
        this.zone.run(() => {
          this.campoActual = 'antecedent_personal';
          console.log('📍 Campo cambiado a: antecedent_personal');

          // 🔥 Le ordenamos al hijo que marque el campo específico de personales
          if (this.compAntecedentes) {
            this.compAntecedentes.focarPersonales();
          }
        });
        return;
      }

      if (textoEvaluar.includes('pasar a familiares') || textoEvaluar.includes('ir a familiares')) {
        this.zone.run(() => {
          this.campoActual = 'antecedent_family';

          // 🔥 Le ordenamos al hijo que marque el campo específico de familiares
          if (this.compAntecedentes) {
            this.compAntecedentes.focarFamiliares();
          }
        });
        return;
      }

      if (textoEvaluar.includes('pasar a alergias') || textoEvaluar.includes('ir a alergias')) {
        this.zone.run(() => {
          this.campoActual = 'antecedent_alerg';

          // 🔥 Le ordenamos al hijo que marque el campo específico de alergias
          if (this.compAntecedentes) {
            this.compAntecedentes.focarAlergias();
          }
        });
        return;
      }

      if (
        textoEvaluar.includes('pasar a enfermedad') ||
        textoEvaluar.includes('pasar a enfermedad actual') ||
        textoEvaluar.includes('ir a enfermedad actual')
      ) {
        this.zone.run(() => {
          this.campoActual = 'enfermedad_actual';

          // 🔥 ¡LA CLAVE DIRECTA! Le ordenamos al hijo que active su foco interno
          if (this.compEnfermedad) {
            this.compEnfermedad.focarEnfermedad();
          }
        });
        return;
      }
      if (textoEvaluar.includes('pasar a examen') || textoEvaluar.includes('ir a examen')) {
        this.zone.run(() => {
          this.campoActual = 'examen_fisico';
          // 🔥 CORREGIDO: Llamamos a focarExamen()
          if (this.compExamen) {
            this.compExamen.focarExamen();
          }
        });
        return;
      }

      if (textoEvaluar.includes('pasar a diagnóstico') || textoEvaluar.includes('ir a diagnóstico')) {
        this.zone.run(() => {
          this.campoActual = 'diagnostico';
          // 🔥 CORREGIDO: Llamamos a focarDiagnostico()
          if (this.compDiagnostico) {
            this.compDiagnostico.focarDiagnostico();
          }
        });
        return;
      }

      if (textoEvaluar.includes('pasar a tratamiento') || textoEvaluar.includes('ir a tratamiento')) {
        this.zone.run(() => {
          this.campoActual = 'tratamiento';
          // 🔥 CORREGIDO: Llamamos a focarTratamiento()
          if (this.compTratamiento) {
            this.compTratamiento.focarTratamiento();
          }
        });
        return;
      }

      // vacunas
      if (textoEvaluar.includes('pasar a vacunas') || textoEvaluar.includes('ir a vacunas') || textoEvaluar.includes('pasar a vacuna')) {
        this.zone.run(() => {
          this.campoActual = 'name_medical';
          // 🔥 Llamamos al componente usando el nombre correcto
          if (this.vacunasHijo) this.vacunasHijo.focarVacunaNombre();
        });
        return;
      }

      if (textoEvaluar.includes('pasar a fecha de vacuna') || textoEvaluar.includes('fecha de vacuna')) {
        this.zone.run(() => {
          this.campoActual = 'fecha_vacuna';
          if (this.vacunasHijo) this.vacunasHijo.focarVacunaFecha();
        });
        return;
      }

      if (textoEvaluar.includes('pasar a cantidad de vacuna') || textoEvaluar.includes('pasar a cantidad')) {
        this.zone.run(() => {
          this.campoActual = 'cantidad';
          if (this.vacunasHijo) this.vacunasHijo.focarVacunaCantidad();
        });
        return;
      }

      if (textoEvaluar.includes('agregar vacuna') || textoEvaluar.includes('agregar vacunas') || textoEvaluar === 'agregar') {
        this.zone.run(() => {
          if (this.vacunasHijo) {
            this.vacunasHijo.addVacuna(); // Dispara el método de tu hijo
            this.vacunasHijo.focarVacunaNombre(); // Devuelve el cursor visual al inicio de la tabla
          }
        });
        return;
      }

      // ==========================================
      // COMANDOS DE VOZ: EVOLUCIÓN
      // ==========================================

      if (textoEvaluar.includes('pasar a evolución') || textoEvaluar.includes('pasar a evolucion') || textoEvaluar.includes('ir a evolución')) {
        this.zone.run(() => {
          this.campoActual = 'name_evolucion';
          if (this.evolucionHijo) this.evolucionHijo.focarEvolucionNombre();
        });
        return;
      }

      if (textoEvaluar.includes('pasar a fecha de evolución') || textoEvaluar.includes('ir a fecha de evolución') || textoEvaluar.includes('fecha de evolución')) {
        this.zone.run(() => {
          this.campoActual = 'fecha_evolucion';
          if (this.evolucionHijo) this.evolucionHijo.focarEvolucionFecha();
        });
        return;
      }

      if (textoEvaluar.includes('agregar evolución') || textoEvaluar.includes('agregar evolucion') || textoEvaluar === 'agregar') {
        this.zone.run(() => {
          if (this.evolucionHijo) {
            this.evolucionHijo.addEvolucion(); // Agrega el ítem a la lista en el hijo
            this.evolucionHijo.focarEvolucionNombre(); // Regresa automáticamente al inicio de la fila
          }
        });
        return;
      }


      // Comando unificado: GUARDA
      if (textoEvaluar.includes('guardar') || textoEvaluar.includes('guardar historia')) {
        this.zone.run(() => {

          // 🔥 1. APAGAMOS EL DICTADO DE FORMA MANUAL
          // Apaga el reconocimiento de voz de la API de Angular para detener el spinner
          if (this.isListening) {
            // Si tu función de palanca se llama toggleDictadoGlobal, la desactivamos pasando false
            // O si tienes un método directo como this.stopListening(), llámalo aquí.
            this.isListening = false;

            // Detenemos el motor de la API de reconocimiento de voz nativo (Web Speech API)
            if (this.recognition) {
              this.recognition.stop();
            }
          }

          // 2. EJECUTAMOS EL GUARDADO ORIGINAL
          this.save();
        });
        return;
      }


      // =========================================================================
      // ✍️ 2. SECCIÓN DE ESCRITURA CON NGZONE (Campos del Historial)
      // =========================================================================
      this.zone.run(() => {

        // --- ENFERMEDAD ACTUAL ---
        if (this.campoActual === 'current_desease') {
          // 1. Extraemos el valor real que ya está en la pantalla
          let textoActualEnPantalla = this.patientForm.get('current_desease')?.value || '';

          // 2. Comando: Limpiar todo
          if (textoEvaluar.includes('limpiar todo') || textoEvaluar.includes('borrar todo')) {
            this.actualizarTexto('', 'current_desease');
            return;
          }

          // 3. Comando: Punto y aparte
          if (textoEvaluar.includes('punto y aparte')) {
            textoActualEnPantalla = textoActualEnPantalla ? `${textoActualEnPantalla.trim()}.\n\n` : '';
            this.actualizarTexto(textoActualEnPantalla, 'current_desease');
            return;
          }

          // 4. Comando: Punto y seguido
          if (textoEvaluar.includes('punto y seguido')) {
            textoActualEnPantalla = textoActualEnPantalla ? `${textoActualEnPantalla.trim()}. ` : '';
            this.actualizarTexto(textoActualEnPantalla, 'current_desease');
            return;
          }

          // 5. Procesamiento del texto nuevo (Tu lógica de mayúsculas)
          let textoFinal = rawText.trim();
          if (!textoActualEnPantalla || textoActualEnPantalla.endsWith('\n') || textoActualEnPantalla.endsWith('. ')) {
            textoFinal = textoFinal.charAt(0).toUpperCase() + textoFinal.slice(1);
          }

          // 6. Concatenamos de forma segura con lo que ya existía en el formulario
          textoActualEnPantalla = textoActualEnPantalla
            ? (textoActualEnPantalla.endsWith('\n') || textoActualEnPantalla.endsWith(' ') ? textoActualEnPantalla + textoFinal : textoActualEnPantalla + ' ' + textoFinal)
            : textoFinal;

          // 7. Enviamos el resultado al formulario reactivo
          this.actualizarTexto(textoActualEnPantalla, 'current_desease');
        }


        // --- ANTECEDENTES PERSONALES ---
        else if (this.campoActual === 'antecedent_personal') {
          // 1. Extraemos el valor real que ya se encuentra en la pantalla
          const textoActualEnPantalla = this.patientForm.get('antecedent_personal')?.value || '';

          // 2. Comando: Limpiar todo
          if (textoEvaluar.includes('limpiar todo') || textoEvaluar.includes('borrar todo')) {
            this.actualizarTexto('', 'antecedent_personal');
            return;
          }

          // 3. Procesamiento del texto nuevo (Mayúscula inicial automática)
          let textoFinal = rawText.trim();
          if (!textoActualEnPantalla || textoActualEnPantalla.endsWith('\n') || textoActualEnPantalla.endsWith('. ')) {
            textoFinal = textoFinal.charAt(0).toUpperCase() + textoFinal.slice(1);
          }

          // 4. Concatenamos el contenido anterior con la nueva frase dictada
          const resultadoCompleto = textoActualEnPantalla ? `${textoActualEnPantalla.trim()} ${textoFinal}` : textoFinal;

          // 5. Sincronizamos el resultado final con el formulario reactivo
          this.actualizarTexto(resultadoCompleto, 'antecedent_personal');
        }


        // --- ANTECEDENTES FAMILIARES ---
        else if (this.campoActual === 'antecedent_family') {
          if (textoEvaluar.includes('limpiar todo') || textoEvaluar.includes('borrar todo')) {
            this.antecedent_family = '';
            this.actualizarTexto('', 'antecedent_family');
            return;
          }
          let textoFinal = rawText.trim();
          if (!this.antecedent_family || this.antecedent_family.endsWith('\n') || this.antecedent_family.endsWith('. ')) {
            textoFinal = textoFinal.charAt(0).toUpperCase() + textoFinal.slice(1);
          }
          this.antecedent_family = this.antecedent_family ? `${this.antecedent_family.trim()} ${textoFinal}` : textoFinal;
          this.actualizarTexto(this.antecedent_family, 'antecedent_family');
        }

        // --- ALERGIAS ---
        else if (this.campoActual === 'antecedent_alerg') {
          // 1. Extraemos el valor real que ya se encuentra en la pantalla
          const textoActualEnPantalla = this.patientForm.get('antecedent_alerg')?.value || '';

          // 2. Comando: Limpiar todo
          if (textoEvaluar.includes('limpiar todo') || textoEvaluar.includes('borrar todo')) {
            this.actualizarTexto('', 'antecedent_alerg');
            return;
          }

          // 3. Procesamiento del texto nuevo (Mayúscula inicial automática)
          let textoFinal = rawText.trim();
          if (!textoActualEnPantalla || textoActualEnPantalla.endsWith('\n') || textoActualEnPantalla.endsWith('. ')) {
            textoFinal = textoFinal.charAt(0).toUpperCase() + textoFinal.slice(1);
          }

          // 4. Concatenamos el contenido anterior con la nueva frase dictada
          const resultadoCompleto = textoActualEnPantalla ? `${textoActualEnPantalla.trim()} ${textoFinal}` : textoFinal;

          // 5. Sincronizamos el resultado final con el formulario reactivo
          this.actualizarTexto(resultadoCompleto, 'antecedent_alerg');
        }


        // --- enfermedad_actual ---
        else if (this.campoActual === 'enfermedad_actual') {
          // 1. Extraemos el valor real que ya se encuentra en la pantalla
          const textoActualEnPantalla = this.patientForm.get('enfermedad_actual')?.value || '';

          // 2. Comando: Limpiar todo
          if (textoEvaluar.includes('limpiar todo') || textoEvaluar.includes('borrar todo')) {
            this.actualizarTexto('', 'enfermedad_actual');
            return;
          }

          // 3. Procesamiento del texto nuevo (Mayúscula inicial automática)
          let textoFinal = rawText.trim();
          if (!textoActualEnPantalla || textoActualEnPantalla.endsWith('\n') || textoActualEnPantalla.endsWith('. ')) {
            textoFinal = textoFinal.charAt(0).toUpperCase() + textoFinal.slice(1);
          }

          // 4. Concatenamos el contenido anterior con la nueva frase dictada
          const resultadoCompleto = textoActualEnPantalla ? `${textoActualEnPantalla.trim()} ${textoFinal}` : textoFinal;

          // 5. Sincronizamos el resultado final con el formulario reactivo
          this.actualizarTexto(resultadoCompleto, 'enfermedad_actual');
        }


        // --- examen_fisico ---
        else if (this.campoActual === 'examen_fisico') {
          // 1. Extraemos el valor real que ya se encuentra en la pantalla
          const textoActualEnPantalla = this.patientForm.get('examen_fisico')?.value || '';

          // 2. Comando: Limpiar todo
          if (textoEvaluar.includes('limpiar todo') || textoEvaluar.includes('borrar todo')) {
            this.actualizarTexto('', 'examen_fisico');
            return;
          }

          // 3. Procesamiento del texto nuevo (Mayúscula inicial automática)
          let textoFinal = rawText.trim();
          if (!textoActualEnPantalla || textoActualEnPantalla.endsWith('\n') || textoActualEnPantalla.endsWith('. ')) {
            textoFinal = textoFinal.charAt(0).toUpperCase() + textoFinal.slice(1);
          }

          // 4. Concatenamos el contenido anterior con la nueva frase dictada
          const resultadoCompleto = textoActualEnPantalla ? `${textoActualEnPantalla.trim()} ${textoFinal}` : textoFinal;

          // 5. Sincronizamos el resultado final con el formulario reactivo
          this.actualizarTexto(resultadoCompleto, 'examen_fisico');
        }



        // --- diagnostico ---
        else if (this.campoActual === 'diagnostico') {
          // 1. Extraemos el valor real que ya se encuentra en la pantalla
          const textoActualEnPantalla = this.patientForm.get('diagnostico')?.value || '';

          // 2. Comando: Limpiar todo
          if (textoEvaluar.includes('limpiar todo') || textoEvaluar.includes('borrar todo')) {
            this.actualizarTexto('', 'diagnostico');
            return;
          }

          // 3. Procesamiento del texto nuevo (Mayúscula inicial automática)
          let textoFinal = rawText.trim();
          if (!textoActualEnPantalla || textoActualEnPantalla.endsWith('\n') || textoActualEnPantalla.endsWith('. ')) {
            textoFinal = textoFinal.charAt(0).toUpperCase() + textoFinal.slice(1);
          }

          // 4. Concatenamos el contenido anterior con la nueva frase dictada
          const resultadoCompleto = textoActualEnPantalla ? `${textoActualEnPantalla.trim()} ${textoFinal}` : textoFinal;

          // 5. Sincronizamos el resultado final con el formulario reactivo
          this.actualizarTexto(resultadoCompleto, 'diagnostico');
        }


        // --- tratamiento ---
        else if (this.campoActual === 'tratamiento') {
          // 1. Extraemos el valor real que ya se encuentra en la pantalla
          const textoActualEnPantalla = this.patientForm.get('tratamiento')?.value || '';

          // 2. Comando: Limpiar todo
          if (textoEvaluar.includes('limpiar todo') || textoEvaluar.includes('borrar todo')) {
            this.actualizarTexto('', 'tratamiento');
            return;
          }

          // 3. Procesamiento del texto nuevo (Mayúscula inicial automática)
          let textoFinal = rawText.trim();
          if (!textoActualEnPantalla || textoActualEnPantalla.endsWith('\n') || textoActualEnPantalla.endsWith('. ')) {
            textoFinal = textoFinal.charAt(0).toUpperCase() + textoFinal.slice(1);
          }

          // 4. Concatenamos el contenido anterior con la nueva frase dictada
          const resultadoCompleto = textoActualEnPantalla ? `${textoActualEnPantalla.trim()} ${textoFinal}` : textoFinal;

          // 5. Sincronizamos el resultado final con el formulario reactivo
          this.actualizarTexto(resultadoCompleto, 'tratamiento');
        }


        // --- vacunas ---


        else if (this.campoActual === 'name_medical') {
          if (textoEvaluar.includes('limpiar todo') || textoEvaluar.includes('borrar todo')) {
            if (this.vacunasHijo) this.vacunasHijo.name_medical = '';
            return;
          }

          // 🔥 Extraemos lo que ya esté escrito en la pantalla del hijo
          const textoActualEnHijo = this.vacunasHijo ? this.vacunasHijo.name_medical || '' : '';

          let textoFinal = rawText.trim();
          if (!textoActualEnHijo || textoActualEnHijo.endsWith('\n') || textoActualEnHijo.endsWith('. ')) {
            textoFinal = textoFinal.charAt(0).toUpperCase() + textoFinal.slice(1);
          }

          // Concatenamos respetando lo anterior
          const resultadoCompleto = textoActualEnHijo ? `${textoActualEnHijo.trim()} ${textoFinal}` : textoFinal;

          if (this.vacunasHijo) {
            this.vacunasHijo.name_medical = resultadoCompleto;
          }
        }

        else if (this.campoActual === 'cantidad') {
          if (textoEvaluar.includes('limpiar todo') || textoEvaluar.includes('borrar todo')) {
            this.cantidad = 0;
            if (this.vacunasHijo) this.vacunasHijo.cantidad = 0;
            return;
          }

          // Convertimos el texto dictado (ej: "dos" o "2") a número real
          const numeroDictado = Number(rawText.trim());
          if (!isNaN(numeroDictado)) {
            this.cantidad = numeroDictado;
            if (this.vacunasHijo) {
              this.vacunasHijo.cantidad = this.cantidad;
            }
          }
        }

        else if (this.campoActual === 'fecha_vacuna') {
          // 1. Comando Limpiar Todo
          if (textoEvaluar.includes('limpiar todo') || textoEvaluar.includes('borrar todo')) {
            this.fecha_vacuna = '';
            if (this.vacunasHijo) this.vacunasHijo.fecha_vacuna = '';
            return;
          }

          // 2. Limpieza del texto recibido (Convertimos a minúsculas y removemos conectores como "de")
          let textoFecha = rawText.trim().toLowerCase().replace(/ de /g, ' ');
          let fechaFormateada = '';

          // Atajo rápido por voz para agilizar la consulta
          if (textoFecha.includes('hoy')) {
            const hoy = new Date();
            fechaFormateada = hoy.toISOString().split('T')[0]; // Formato YYYY-MM-DD
          } else {
            // 🔥 Capturamos bloques numéricos separados por espacios, guiones o barras (ej: "30 06 2026")
            const numeros = textoFecha.match(/\d+/g);

            if (numeros && numeros.length === 3) {
              let dia = numeros[0].padStart(2, '0');
              let mes = numeros[1].padStart(2, '0');
              let anio = numeros[2];

              // Si el año viene en formato corto de 2 dígitos (ej: "26"), lo llevamos a "2026"
              if (anio.length === 2) {
                anio = '20' + anio;
              }

              // Reordenamos al formato estricto que exige el HTML5: YYYY-MM-DD
              fechaFormateada = `${anio}-${mes}-${dia}`;
            }
          }

          // 3. 🔥 Sincronizamos e inyectamos el valor exacto en el componente hijo
          if (fechaFormateada) {
            this.fecha_vacuna = fechaFormateada;
            if (this.vacunasHijo) {
              this.vacunasHijo.fecha_vacuna = this.fecha_vacuna;
            }
          }
        }
        // --- evolucion ---

        else if (this.campoActual === 'name_evolucion') {
          if (textoEvaluar.includes('limpiar todo') || textoEvaluar.includes('borrar todo')) {
            if (this.evolucionHijo) this.evolucionHijo.name_evolucion = '';
            return;
          }

          // 🔥 Extraemos lo que ya esté escrito en la pantalla del hijo de evolución
          const textoActualEnHijo = this.evolucionHijo ? this.evolucionHijo.name_evolucion || '' : '';

          let textoFinal = rawText.trim();
          if (!textoActualEnHijo || textoActualEnHijo.endsWith('\n') || textoActualEnHijo.endsWith('. ')) {
            textoFinal = textoFinal.charAt(0).toUpperCase() + textoFinal.slice(1);
          }

          // Concatenamos respetando lo anterior
          const resultadoCompleto = textoActualEnHijo ? `${textoActualEnHijo.trim()} ${textoFinal}` : textoFinal;

          if (this.evolucionHijo) {
            this.evolucionHijo.name_evolucion = resultadoCompleto;
          }
        }




        else if (this.campoActual === 'fecha_evolucion') {
          // 1. Comando Limpiar Todo
          if (textoEvaluar.includes('limpiar todo') || textoEvaluar.includes('borrar todo')) {
            this.fecha_evolucion = '';
            if (this.evolucionHijo) this.evolucionHijo.fecha_evolucion = '';
            return;
          }

          // 2. Limpieza del texto recibido (Convertimos a minúsculas y removemos conectores como "de")
          let textoFecha = rawText.trim().toLowerCase().replace(/ de /g, ' ');
          let fechaFormateada = '';

          // Atajo rápido por voz para agilizar la consulta
          if (textoFecha.includes('hoy')) {
            const hoy = new Date();
            fechaFormateada = hoy.toISOString().split('T')[0]; // Formato YYYY-MM-DD
          } else {
            // 🔥 Capturamos bloques numéricos separados por espacios, guiones o barras (ej: "30 06 2026")
            const numeros = textoFecha.match(/\d+/g);

            if (numeros && numeros.length === 3) {
              let dia = numeros[0].padStart(2, '0');
              let mes = numeros[1].padStart(2, '0');
              let anio = numeros[2];

              // Si el año viene en formato corto de 2 dígitos (ej: "26"), lo llevamos a "2026"
              if (anio.length === 2) {
                anio = '20' + anio;
              }

              // Reordenamos al formato estricto que exige el HTML5: YYYY-MM-DD
              fechaFormateada = `${anio}-${mes}-${dia}`;
            }
          }

          // 3. 🔥 Sincronizamos e inyectamos el valor exacto en el componente hijo
          if (fechaFormateada) {
            this.fecha_evolucion = fechaFormateada;
            if (this.evolucionHijo) {
              this.evolucionHijo.fecha_evolucion = this.fecha_evolucion;
            }
          }
        }



      });
    };

    this.recognition.onerror = (event: any) => {
      console.error('Error en el dictado:', event.error);
    };
  }

  actualizarTexto(valor: string, campo: string) {
    this.zone.run(() => {
      // patchValue actualiza dinámicamente el formControlName que le pases por parámetro
      // Ej: campo = 'enfermedad_actual', 'examen_fisico', etc.
      this.patientForm.patchValue({
        [campo]: valor
      });
    });
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
      is_vacuna: [''],
      current_desease: [''],
      diagnostico: [''],
      vacunas: [[]], // Inicialízalo explícitamente como un array vacío desde el Padre
      evolucion: [[]],
      doctorId: [this.doctor_id]
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
    // console.log('DEBUG patient-form loadPatient: calling getPatient(', +this.patientId!, ')');
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
        gender: this.patient_selected.gender !== undefined && this.patient_selected.gender !== null ? String(this.patient_selected.gender) : '',
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
        is_vacuna: this.patient_selected.is_vacuna,
        talla_al_nacer: this.patient_selected.talla_al_nacer || 0,
        peso_al_nacer: this.patient_selected.peso_al_nacer || 0,
        tratamiento: this.patient_selected.tratamiento || '',
        historia_enfermedad: this.patient_selected.historia_enfermedad || '',
        diagnostico: this.patient_selected.diagnostico || '',
        examen_fisico: this.patient_selected.examen_fisico || '',
        enfermedad_actual: this.patient_selected.enfermedad_actual || '',
        // Sincronizamos las llaves del formulario reactivo con los datos del backend

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

      // 2. Le pasamos el array plano de vacunas directamente al control del formulario
      this.patientForm.patchValue({
        // ... tus otros campos (name, surname, etc) ...
        vacunas: this.patient_selected.vacunas || [],   // 👈 Array plano directo
        evolucion: this.patient_selected.evolucion || [] // 👈 Array plano directo
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


  toggleVacuna(event: any) {
    // 1. Capturamos si el switch quedó encendido (true) o apagado (false)
    const isChecked = event.target.checked;

    // 2. 🎯 ACTUALIZACIÓN DIRECTA: Guardamos el booleano en el FormGroup de Angular
    // (Reemplaza 'this.form' por el nombre exacto de tu FormGroup, ej: this.patientForm)
    this.patientForm.get('is_vacuna')?.setValue(isChecked);

    console.log('Control de Angular actualizado a booleano:', this.patientForm.get('is_vacuna')?.value);
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
    // 1. Extraemos el valor actual del formulario (puede ser true, false, 1 o 2)
    const estadoVacunaForm = this.patientForm.get('is_vacuna')?.value;



    // =========================================================================
    // 🎯 TRADUCCIÓN EXPLICITA PARA EL TIPO SMALLINT DE POSTGRESQL
    // =========================================================================
    // Evaluamos el booleano real del formulario e inyectamos manualmente el número correcto
    const estadoVacuna = this.patientForm.get('is_vacuna')?.value;
    const valorSmallint = (estadoVacuna === true || estadoVacuna === 2) ? '2' : '1';

    formData.append('is_vacuna', valorSmallint);

    console.log('🚀 Envío blindado a PostgreSQL - is_vacuna:', valorSmallint); 5

    // Append all fields (optional skipped if empty as per original)
    formData.append('name', formValue.name);
    formData.append('surname', formValue.surname);
    formData.append('phone', formValue.phone || '');
    formData.append('gender', formValue.gender.toString());
    formData.append('address', formValue.address || '');
    formData.append('n_doc', formValue.n_doc);
    formData.append('talla', formValue.talla);
    // formData.append('historia_enfermedad', formValue.historia_enfermedad);
    formData.append('enfermedad_actual', formValue.enfermedad_actual);
    formData.append('tratamiento', formValue.tratamiento);
    formData.append('examen_fisico', formValue.examen_fisico);
    formData.append('reporte_laboratorio', formValue.reporte_laboratorio);
    formData.append('peso_al_nacer', formValue.peso_al_nacer);
    formData.append('talla_al_nacer', formValue.talla_al_nacer);
    formData.append('diganostico', formValue.diagnostico || formValue.diganostico || '');
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
      // 🎯 CORRECCIÓN: Agregamos 'is_vacuna' a las excepciones para que no se meta como "false"
      if (key !== 'vacunas' && key !== 'evolucion' && key !== 'is_vacuna') {
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
