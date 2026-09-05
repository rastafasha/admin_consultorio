import { Component, ChangeDetectorRef, NgZone, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppointmentService } from '../../../services/appointment.service';
import Swal from 'sweetalert2';
import { routes } from '../../../shared/routes/routes';
import { StaffService } from '../../../services/staff.service';

@Component({
  selector: 'app-atencion-medica',
  templateUrl: './atencion-medica.component.html',
  styleUrls: ['./atencion-medica.component.scss'],
  standalone: false
})
export class AtencionMedicaComponent {
  @ViewChild('inputCitaDiagnostico') inputCitaDiagnostico!: ElementRef;
  @ViewChild('inputCitaMedicamento') inputCitaMedicamento!: ElementRef;
  @ViewChild('inputCitaUso') inputCitaUso!: ElementRef;

  public routes = routes;
  isLoading = false;

  valid_form_success = false;
  public text_validation = '';
  public text_success = '';
  name = '';
  surname = '';
  n_doc = 0;
  phone = '';
  name_companion = '';
  surname_companion = '';

  laboratory = false;
  laboratory_number = 1;

  public medical: any = [];
  description: any;
  name_medical: any;
  uso: any;

  appointment_id: any;
  appointment_selected: any;
  appointment_atention_selected: any;
  antecedent_alerg: any;
  user: any;
  roles: any;
  doctor: any;
  doctor_id: any;
  addressconsultorio: any;
  name_consultorio: any;

  // dictado
  recognition: any;
  isListening: boolean = false;
  campoActual: 'description' | 'name_medical' | 'uso' = 'description';

  info_atender_cita = `
  <p>En esta sección :</p>
         <ul>
            <li><strong>Gestión de Cita:</strong> Atiende citas agendadas y visualiza al cargar el historial y condición de salud del paciente.</li>
            <li><strong>Récipe Digital:</strong> Añade el nombre del medicamento y su uso para armar la lista. Al presionar <em>Actualizar</em>, se sincronizará de inmediato en la App del Paciente.</li>
            <li><strong>Asistente de Voz:</strong> Activa el switch y dicta el diagnóstico, medicamentos y dosis sin tocar el teclado.</li>
            <li>
              <strong>Comandos de voz:</strong>
              <br>• <em>Navegación:</em> "pasar a medicamentos" (o "siguiente campo"), "pasar a uso".
              <br>• <em>Acciones:</em> "agregar medicamento", "imprimir récipe" (o "imprimir receta"), "guardar e imprimir".
              <br>• <em>Edición:</em> "limpiar todo", "punto y aparte", "punto y seguido".
            </li>
          </ul>`;


  constructor(
    public appointmentService: AppointmentService,
    public staffService: StaffService,
    public router: Router,
    public ativatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {

  }

  ngOnInit(): void {

    window.scrollTo(0, 0);
    const USER = localStorage.getItem("user");
    this.user = JSON.parse(USER ? USER : '');
    this.doctor_id = this.user.id;
    this.roles = this.user.roles[0];
    this.getUserRemoto()

    this.ativatedRoute.params.subscribe((resp: any) => {
      this.appointment_id = resp.id;
    })
    this.getAppointment();
    this.initSpeechRecognition();
  }

  getUserRemoto(): void {
    if (!this.user?.id) return;
    this.staffService.getUser(this.user.id).subscribe((resp: any) => {
      this.doctor = resp.user;
    });
  }

  getAppointment() {
    this.isLoading = true
    this.appointmentService.showAppointment(this.appointment_id).subscribe((resp: any) => {
      // console.log(resp);
      this.appointment_selected = resp.appointment;

      this.name = this.appointment_selected.patient.name;
      this.surname = this.appointment_selected.patient.surname;
      this.n_doc = this.appointment_selected.patient.n_doc;
      this.phone = this.appointment_selected.patient.phone;
      this.name_companion = this.appointment_selected.patient.name_companion;
      this.surname_companion = this.appointment_selected.patient.surname_companion;
      this.addressconsultorio = this.appointment_selected.consultorio.address;
      this.name_consultorio = this.appointment_selected.consultorio.name_consultorio;
      this.antecedent_alerg = this.appointment_selected.patient.antecedent_alerg;
      this.isLoading = false
    });
    // cita medica

    this.appointmentService.showCitamedica(this.appointment_id).subscribe((resp: any) => {
      this.appointment_atention_selected = resp.appointment_attention;
      this.medical = this.appointment_atention_selected.receta_medica;
      this.description = this.appointment_atention_selected.description;
      this.laboratory_number = this.appointment_atention_selected.laboratory;

      if (this.laboratory_number === 2) {
        this.laboratory = true
      } else {
        this.laboratory = false
      }


    })

  }

  addMedicamento() {
    this.medical.push({
      name_medical: this.name_medical,
      uso: this.uso
    })
    this.name_medical = '';
    this.uso = '';
  }

  deleteMedical(i: any) {
    this.medical.splice(i, 1);
  }


  initSpeechRecognition() {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    console.error('El dictado por voz no es soportado.');
    return;
  }

  // Detectamos si es un dispositivo Apple (iPhone/iPad)
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  this.recognition = new SpeechRecognition();
  
  // 🔥 PARCHE 1: En iPhone continuous DEBE ser false o se congela la API
  this.recognition.continuous = !isIOS; 
  this.recognition.interimResults = false;
  
  // PARCHE 2: Diccionario estándar es más estable en iOS 15 viejo
  this.recognition.lang = isIOS ? 'es-ES' : 'es-VE'; 

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
    if (textoEvaluar.includes('pasar a diagnóstico') || textoEvaluar.includes('ir a diagnóstico')) {
      this.zone.run(() => {
        this.campoActual = 'description';
        setTimeout(() => {
          if (this.inputCitaDiagnostico) this.inputCitaDiagnostico.nativeElement.focus();
        }, 50);
      });
      return;
    }

    if (textoEvaluar.includes('pasar a medicamentos') || textoEvaluar.includes('pasar a medicamento') || textoEvaluar.includes('siguiente campo')) {
      this.zone.run(() => {
        this.campoActual = 'name_medical';
        setTimeout(() => { if (this.inputCitaMedicamento) this.inputCitaMedicamento.nativeElement.focus(); }, 50);
      });
      return;
    }

    if (textoEvaluar.includes('pasar a uso') || textoEvaluar.includes('ir a uso')) {
      this.zone.run(() => {
        this.campoActual = 'uso';
        setTimeout(() => { if (this.inputCitaUso) this.inputCitaUso.nativeElement.focus(); }, 50);
      });
      return;
    }

    if (textoEvaluar.includes('agregar medicamento') || textoEvaluar.includes('agregar')) {
      this.zone.run(() => {
        this.addMedicamento();
        this.actualizarTexto('', 'name_medical');
        this.actualizarTexto('', 'uso');
        this.campoActual = 'name_medical';
        setTimeout(() => { if (this.inputCitaMedicamento) this.inputCitaMedicamento.nativeElement.focus(); }, 50);
      });
      return;
    }

    if (textoEvaluar.includes('imprimir receta') || textoEvaluar.includes('imprimir récipe') || textoEvaluar.includes('guardar e imprimir')) {
      this.zone.run(() => {
        if (this.isListening) {
          this.isListening = false;
          if (this.recognition) this.recognition.stop();
        }
        this.save(true);
      });
      return;
    }

    // ==========================================
    // 2. SECCIÓN DE ESCRITURA (Usando actualizarTexto)
    // ==========================================
    this.zone.run(() => {

      // CAMPO DIAGNÓSTICO
      if (this.campoActual === 'description') {
        if (textoEvaluar.includes('limpiar todo') || textoEvaluar.includes('borrar todo')) {
          this.actualizarTexto('', 'description');
          return;
        }
        if (textoEvaluar.includes('punto y aparte')) {
          const nuevoValor = this.description ? `${this.description.trim()}.\n\n` : '';
          this.actualizarTexto(nuevoValor, 'description');
          return;
        }
        if (textoEvaluar.includes('punto y seguido')) {
          const nuevoValor = this.description ? `${this.description.trim()}. ` : '';
          this.actualizarTexto(nuevoValor, 'description');
          return;
        }

        let textoFinal = rawText.trim();
        if (!this.description || this.description.endsWith('\n') || this.description.endsWith('. ')) {
          textoFinal = textoFinal.charAt(0).toUpperCase() + textoFinal.slice(1);
        }

        const acumulado = this.description
          ? (this.description.endsWith('\n') || this.description.endsWith(' ') ? this.description + textoFinal : this.description + ' ' + textoFinal)
          : textoFinal;

        this.actualizarTexto(acumulado, 'description');
      }

      // NOMBRE DEL MEDICAMENTO
      else if (this.campoActual === 'name_medical') {
        let textoFinal = rawText.trim();
        textoFinal = textoFinal.charAt(0).toUpperCase() + textoFinal.slice(1);

        const acumulado = this.name_medical ? `${this.name_medical.trim()} ${textoFinal}` : textoFinal;
        this.actualizarTexto(acumulado, 'name_medical');
      }

      // USO DEL MEDICAMENTO
      else if (this.campoActual === 'uso') {
        const acumulado = this.uso ? `${this.uso.trim()} ${rawText.trim()}` : rawText.trim();
        this.actualizarTexto(acumulado, 'uso');
      }

    });
  };

  this.recognition.onerror = (event: any) => {
    console.error('Error en el dictado:', event.error);
    if (event.error === 'not-allowed') {
      alert('Por favor, verifica que Siri y los permisos de micrófono estén activos en los ajustes de tu iPhone.');
    }
  };

  // 🔥 PARCHE 3: El truco para simular continuidad reencendiendo el motor en iOS
  this.recognition.onend = () => {
    if (this.isListening) {
      try {
        this.recognition.start();
      } catch (e) {
        console.log('El motor de voz ya se estaba reiniciando de forma segura.');
      }
    }
  };
}


  // Mantenemos la función de ayuda para el diagnóstico
  actualizarTexto(valor: string, campo: string) {
    this.zone.run(() => {
      if (campo === 'description') {
        this.description = valor;
      } else if (campo === 'name_medical') {
        this.name_medical = valor;
      } else if (campo === 'uso') {
        this.uso = valor;
      }
    });
  }

  toggleDictadoGlobal() {
  this.isListening = !this.isListening;

  if (this.isListening) {
    // 🔥 CRÍTICO: Inicializamos el campo por defecto para que la voz sepa dónde escribir la primera palabra
    this.campoActual = 'description'; 
    
    // Aquí es donde llamas a tu motor nativo
    this.initSpeechRecognition();
    this.recognition.start();
  } else {
    if (this.recognition) {
      this.recognition.stop();
    }
  }
}
  save(debeImprimir: boolean = false) {
    this.text_validation = '';
    if (!this.description || this.medical.length == 0) {
      this.text_validation = 'Es requerido ingresar el diagnostico y una receta medica';
      return;
    }

    if (this.laboratory == true) {
      this.laboratory_number = 2
    } else {
      this.laboratory_number = 1
    }

    const data = {
      appointment_id: this.appointment_id,
      description: this.description,
      medical: this.medical,
      laboratory: this.laboratory_number,
      patient_id: this.appointment_selected.patient_id,
    }

    this.appointmentService.registerAttention(data).subscribe((resp: any) => {
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
        this.text_success = 'Se guardó la informacion de la cita médica'
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: this.text_success,
          showConfirmButton: false,
          timer: 1500
        });

        // =========================================================
        // LA CLAVE: DISPARAR LA IMPRESIÓN ANTES DE CAMBIAR DE RUTA
        // =========================================================
        if (debeImprimir) {
          this.imprimirRecipe(); // Imprime usando el arreglo completo de medicines que guardaste
        }

        if (this.user.roles === 'SUPERADMIN') {
          this.router.navigate(['/appointments/list']);
        }
        if (this.user.roles === 'DOCTOR') {
          this.router.navigate(['/appointments/list/doctor/', this.user.id]);
        }
      }
    })
  }

  imprimirRecipe() {
    // Crear una ventana flotante para la impresión
    const logoBase64 = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDE3OC40IDIxNy42IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxNzguNCAyMTcuNjsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOnVybCgjU1ZHSURfMV8pO30KCS5zdDF7ZmlsbDojRkZGRkZGO30KCS5zdDJ7ZmlsbDojNzM2MEE5O30KPC9zdHlsZT4KPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF8xXyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSI5MC40MjY1IiB5MT0iMTM3LjY2IiB4Mj0iOTAuNDI2NSIgeTI9Ii0xNi42MSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgxIDAgMCAtMSAwIDIyNikiPgoJPHN0b3Agb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojNkE0RUEwIj48L3N0b3A+Cgk8c3RvcCBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOiMyNjIyNjIiPjwvc3RvcD4KPC9saW5lYXJHcmFkaWVudD4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTM2LjUsOS40aDEwNy45YzEyLjgsMCwyMy4yLDEwLjQsMjMuMiwyMy4ydjExMS42YzAsMTIuOC0xMC40LDIzLjItMjMuMiwyMy4ySDM2LjUgIGMtMTIuOCwwLTIzLjItMTAuNC0yMy4yLTIzLjJWMzIuNUMxMy4zLDE5LjcsMjMuNyw5LjQsMzYuNSw5LjR6Ij48L3BhdGg+CjxnPgoJPHBhdGggY2xhc3M9InN0MSIgZD0iTTEzMC41LDM2LjNoLTgxYy0xMCwwLTExLjksMTEuMy0xMS45LDExLjN2NDcuMWMwLDAtMC43LDEzLjYsMTIuMywxMy42aDYxLjNWOTMuNGMwLDAsMTcuMS01LjIsMTcuMS0xOVY1NC4xICAgaC05di0zLjloLTYuNHYxMi45aDYuMXYtMy4yaDIuNnYxNi41YzAsMC0xLDkuMi0xMi4zLDkuMmMtMTEuOSwwLTEzLjktMTAuMi0xMy45LTEwLjJWNTkuNWgyLjN2NC4yaDUuOFY1MC4yaC01Ljh2My41aC04LjcgICBjMCwwLTAuMywxMy42LDAsMjAuN2MxLjYsMTQuMiwxNi41LDE4LjEsMTYuNSwxOC4xdjkuNGMwLDAtNDkuNCwwLjctNTUuNSwwYy02LjEtMC43LTUuNS01LjItNS41LTUuMlY0OC4yYzAsMCwwLjMtNS44LDYuMS01LjggICBzNzMuOS0wLjMsODAuNywwYzYuOCwwLjMsNS44LDcuNCw1LjgsNy40djYzLjloLTM2LjVMODMuNSwxMzBjLTIuMS0xLjUtNC42LTIuNC03LjQtMi40Yy03LDAtMTIuNyw1LjctMTIuNywxMi43ICAgUzY5LjEsMTUzLDc2LjEsMTUzczEyLjctNS43LDEyLjctMTIuN2MwLTIuMS0wLjUtNC4xLTEuNC01LjhsMTUuNi0xNWg0MC4zVjQ3QzE0My4zLDQ3LDE0My42LDM2LjMsMTMwLjUsMzYuM0wxMzAuNSwzNi4zeiAgICBNNzYuMSwxNDguN2MtNC42LDAtOC40LTMuOC04LjQtOC40czMuOC04LjQsOC40LTguNHM4LjQsMy44LDguNCw4LjRTODAuOCwxNDguNyw3Ni4xLDE0OC43eiI+PC9wYXRoPgoJPGVsbGlwc2UgY2xhc3M9InN0MSIgY3g9IjU4LjkiIGN5PSI3MiIgcng9IjQuNSIgcnk9IjcuNiI+PC9lbGxpcHNlPgoJPGVsbGlwc2UgY2xhc3M9InN0MSIgY3g9Ijc2LjEiIGN5PSI3MiIgcng9IjQuNSIgcnk9IjcuNiI+PC9lbGxpcHNlPgoJPGNpcmNsZSBjbGFzcz0ic3QxIiBjeD0iNzYuMSIgY3k9IjE0MC4zIiByPSI0LjUiPjwvY2lyY2xlPgo8L2c+CjxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik0xMzAuNSwzNi4zaC04MWMtMTAsMC0xMS45LDExLjMtMTEuOSwxMS4zdjQ3LjFjMCwwLTAuNywxMy42LDEyLjMsMTMuNmg2MS4zVjkzLjRjMCwwLDE3LjEtNS4yLDE3LjEtMTlWNTQuMSAgaC05di0zLjloLTYuNHYxMi45aDYuMXYtMy4yaDIuNnYxNi41YzAsMC0xLDkuMi0xMi4zLDkuMmMtMTEuOSwwLTEzLjktMTAuMi0xMy45LTEwLjJWNTkuNWgyLjN2NC4yaDUuOFY1MC4yaC01Ljh2My41aC04LjcgIGMwLDAtMC4zLDEzLjYsMCwyMC43YzEuNiwxNC4yLDE2LjUsMTguMSwxNi41LDE4LjF2OS40YzAsMC00OS40LDAuNy01NS41LDBjLTYuMS0wLjctNS41LTUuMi01LjUtNS4yVjQ4LjJjMCwwLDAuMy01LjgsNi4xLTUuOCAgczczLjktMC4zLDgwLjcsMGM2LjgsMC4zLDUuOCw3LjQsNS44LDcuNHY2My45aC0zNi41TDgzLjUsMTMwYy0yLjEtMS41LTQuNi0yLjQtNy40LTIuNGMtNywwLTEyLjcsNS43LTEyLjcsMTIuN1M2OS4xLDE1Myw3Ni4xLDE1MyAgczEyLjctNS43LDEyLjctMTIuN2MwLTIuMS0wLjUtNC4xLTEuNC01LjhsMTUuNi0xNWg0MC4zVjQ3QzE0My4zLDQ3LDE0My42LDM2LjMsMTMwLjUsMzYuM0wxMzAuNSwzNi4zeiBNNzYuMSwxNDguNyAgYy00LjYsMC04LjQtMy44LTguNC04LjRzMy44LTguNCw4LjQtOC40czguNCwzLjgsOC40LDguNFM4MC44LDE0OC43LDc2LjEsMTQ4Ljd6Ij48L3BhdGg+CjxlbGxpcHNlIGNsYXNzPSJzdDEiIGN4PSI5MC40IiBjeT0iNzIiIHJ4PSI0LjUiIHJ5PSI3LjYiPjwvZWxsaXBzZT4KPGVsbGlwc2UgY2xhc3M9InN0MSIgY3g9IjkwLjQiIGN5PSI3MiIgcng9IjQuNSIgcnk9IjcuNiI+PC9lbGxpcHNlPgo8Y2lyY2xlIGNsYXNzPSJzdDEiIGN4PSI5MC40IiBjeT0iMTQwLjMiIHI9IjQuNSI+PC9jaXJjbGU+CjxnPgoJPGc+CgkJPHBhdGggY2xhc3M9InN0MiIgZD0iTTI1LjQsMTk1bDguNC05LjZoOC41bC0xMC42LDExLjFsMTEuNiwxMi4zaC05bC05LTEwLjF2MTAuMWgtNi45di0yMy40aDYuOVYxOTV6Ij48L3BhdGg+CgkJPHBhdGggY2xhc3M9InN0MiIgZD0iTTUyLDE4NS40djE4LjJoOC4zdjUuMUg0NXYtMjMuNEg1MnoiPjwvcGF0aD4KCQk8cGF0aCBjbGFzcz0ic3QyIiBkPSJNNjYuMiwxOTcuNWwtOS43LTEyLjFoOC4zbDQuOSw2LjRsNC45LTYuNGg4LjNsLTkuOCwxMi4xdjExLjJoLTYuOVYxOTcuNXoiPjwvcGF0aD4KCQk8cGF0aCBjbGFzcz0ic3QyIiBkPSJNODMuOSwyMDguN3YtMjMuNGg2LjlsMTIuOCwxNC4zdi0xNC4zaDYuOXYyMy40aC02LjlsLTEyLjgtMTQuM3YxNC4zSDgzLjl6Ij48L3BhdGg+CgkJPHBhdGggY2xhc3M9InN0MiIgZD0iTTEyNC43LDE5MC41djE4LjJoLTYuOXYtMTguMmgtNS43di01LjFoMTguM3Y1LjFIMTI0Ljd6Ij48L3BhdGg+CgkJPHBhdGggY2xhc3M9InN0MiIgZD0iTTEzOSwxODUuNHYyMy40aC02Ljl2LTIzLjRIMTM5eiI+PC9wYXRoPgoJCTxwYXRoIGNsYXNzPSJzdDIiIGQ9Ik0xNjIuNCwxOTMuMmMtMS42LTEuNy0zLjYtMi42LTUuOS0yLjZjLTEsMC0yLDAuMi0yLjksMC41Yy0wLjksMC4zLTEuNiwwLjgtMi4zLDEuM3MtMS4xLDEuMi0xLjUsMiAgICBjLTAuNCwwLjgtMC41LDEuNi0wLjUsMi41YzAsMC45LDAuMiwxLjgsMC41LDIuNmMwLjQsMC44LDAuOSwxLjUsMS41LDJjMC42LDAuNiwxLjQsMSwyLjMsMS40YzAuOSwwLjMsMS44LDAuNSwyLjgsMC41ICAgIGMyLjIsMCw0LjItMC44LDYtMi41djcuMmwtMC43LDAuMmMtMS4xLDAuMy0yLDAuNi0zLDAuN2MtMC45LDAuMi0xLjgsMC4yLTIuNywwLjJjLTEuOCwwLTMuNi0wLjMtNS4zLTAuOXMtMy4yLTEuNS00LjUtMi42ICAgIGMtMS4zLTEuMS0yLjMtMi40LTMuMS0zLjljLTAuOC0xLjUtMS4yLTMuMi0xLjItNXMwLjQtMy40LDEuMS00LjlzMS44LTIuOCwzLjEtMy45YzEuMy0xLjEsMi44LTEuOSw0LjUtMi41ICAgIGMxLjctMC42LDMuNS0wLjksNS4zLTAuOWMxLjEsMCwyLjEsMC4xLDMuMSwwLjNzMi4xLDAuNSwzLjIsMC45VjE5My4yeiI+PC9wYXRoPgoJPC9nPgo8L2c+Cjwvc3ZnPgo=';
    const ventanaImpresion = window.open('', '_blank', 'width=800,height=600');

    // =========================================================================
    // 📄 GENERACIÓN DE LA LISTA DE MEDICAMENTOS PARA LA IMPRESIÓN
    // =========================================================================
    // Mapeamos el arreglo 'medical' para generar un bloque HTML limpio por cada medicina
    const listaTratamientoHTML = this.medical && this.medical.length > 0
      ? this.medical.map(medicina => `
      <div style="margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px dashed #eee;">
        <p style="margin: 4px 0;"><strong>Medicamento:</strong> ${medicina.name_medical || 'No especificado.'}</p>
        <p style="margin: 4px 0; color: #555;"><strong>Uso:</strong> ${medicina.uso || 'No especificado.'}</p>
      </div>
    `).join('')
      : `<p>No especificado.</p>`;


    if (ventanaImpresion) {
      ventanaImpresion.document.write(`
      <html>
        <head>
          <title>Récipe Médico - Klyntic</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
            
            /* Alineación perfecta para el logo y el título */
            .header { 
              text-align: center; 
              border-bottom: 2px solid #007bff; 
              padding-bottom: 15px; 
            }
            .logo-container {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 10px; /* Espacio entre el logo y el texto */
              margin-bottom: 5px;
            }
            .logoav {
              object-fit: contain;
            }
            
            .content { margin-top: 30px; font-size: 16px; line-height: 1.6; }
            .section { margin-bottom: 20px; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #ddd; padding-top: 10px; }
            h3 { color: #007bff; margin-bottom: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-container">
              <img class="logoav" src="${logoBase64}" width="45" height="45" alt="Klyntic Logo">
              <h2>CONSULTA MÉDICA</h2>
            </div>
            <p style="margin: 0; color: #555; font-weight: bold;">Klyntic App</p>
          </div>
          <div class="section">
              <h3>Médico Especialista:</h3>
              <p style="white-space: pre-wrap;">Dr(a).${this.doctor.name} ${this.doctor.surname}</p>
              <p style="white-space: pre-wrap;">Teléfono: ${this.doctor.mobile}</p>
              <p style="white-space: pre-wrap;">Consultorio: ${this.name_consultorio}</p>
              <p style="white-space: pre-wrap;">Dirección: ${this.addressconsultorio}</p>
            </div>
          
         <div class="content">
    <div class="section">
      <h3>Indicaciones / Diagnóstico:</h3>
      <p style="white-space: pre-wrap;">${this.description || 'No especificado.'}</p>
    </div>
    
    <div class="section">
      <h3>Tratamiento / Récipes:</h3>
      <!-- 🎯 INYECCIÓN ATÓMICA DE LA LISTA COMPLETA DE MEDICAMENTOS -->
      ${listaTratamientoHTML}
    </div>
  </div>
          
          <div class="footer">
            <p>Récipe generado digitalmente a través de Klyntic.</p>
          </div>
        </body>
      </html>
    `);

      ventanaImpresion.document.close();
      ventanaImpresion.focus();

      // Le damos un micro-retraso de 200 milisegundos para que el navegador cargue el logo antes de abrir la impresora
      setTimeout(() => {
        ventanaImpresion.print();
        ventanaImpresion.close();
      }, 200);
    }
  }




} 
