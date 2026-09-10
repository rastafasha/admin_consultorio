import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { routes } from '../../../shared/routes/routes';
import { Router, ActivatedRoute } from '@angular/router';
import { StaffService } from '../../../services/staff.service';
import { OdontogramaService } from '../../../services/odontograma.service';
import { AppointmentService } from '../../../services/appointment.service';
import { ToastrService } from 'ngx-toastr';

// Declaración global para el reconocimiento de voz del navegador (AirPods / Micrófono)
declare var webkitSpeechRecognition: any;

interface Diente {
  numero: number;
  hallazgo: string; // 'Sano', 'Caries', 'Ausente', 'Resina', 'Corona', 'Endodoncia'
  cara_o?: string;  // Estado de cara Oclusal
  cara_m?: string;  // Estado de cara Mesial
  cara_d?: string;  // Estado de cara Distal
  cara_v?: string;  // Estado de cara Vestibular
  cara_l?: string;  // Estado de cara Lingual/Palatina
  notas?: string;
}

@Component({
  selector: 'app-odontograma',
  standalone: false,
  templateUrl: './odontograma.component.html',
  styleUrl: './odontograma.component.scss'
})
export class OdontogramaComponent implements OnInit {

  public routes = routes;
  isLoading = false;
  doctor_id: any;
  doctor: any;
  user: any;
  roles: any;
  appointment_id: any;
  patient_id: any = null;
   name = '';
  surname = '';
  n_doc = 0;
  phone = '';
  name_companion = '';
  surname_companion = '';
  mobile_companion = '';
  appointment_selected: any;
  addressconsultorio: any;
  name_consultorio: any;
  antecedent_alerg: any;


  // Estado visual y de datos de los 32 dientes universales (FDI)
  public odontogramaMapa: Diente[] = [];
  
  // Variables del Asistente de Voz
  private recognition: any;
  public isListening = false;
  public campoActual = 'odontograma'; // Fijamos el contexto en el odontograma



   info_odontograma = `
  <p>En esta sección:</p>
  <ul>
    <li><strong>Odontograma Interactivo:</strong> Visualiza el mapa dental completo del paciente en tiempo real. El sistema guarda la evolución de cada pieza en cada cita de forma cronológica.</li>
    <li><strong>Asistente de Voz Dental:</strong> Diseñado para trabajar 100% "manos libres" con AirPods o audífonos inalámbricos. Le permite revisar la boca del paciente con guantes e instrumentos mientras dicta los hallazgos sin tocar el teclado.</li>
    <li>
      <strong>Comandos de Voz Disponibles:</strong>
      <br>• <em>Formato de Dictado:</em> Diga el número del diente seguido del estado y la cara (opcional). 
      <br>&nbsp;&nbsp;&nbsp;&nbsp;– <strong>Ejemplos:</strong> 
      <em class="text-danger">"Diente catorce caries en oclusal"</em>, 
      <em class="text-secondary">"Diente veintiuno ausente"</em> o 
      <em class="text-primary">"Diente treinta y seis resina en distal"</em>.
      <br>• <em>Estados Soportados:</em> "Caries", "Resina" (o "calza"), "Ausente" (o "falta"), "Corona", "Endodoncia" (o "conducto") y "Sano" (o "limpio").
      <br>• <em>Caras del Diente:</em> "Oclusal", "Mesial", "Distal", "Vestibular", "Lingual" y "Palatina".
      <br>• <em>Acciones de Guardado:</em> "guardar" (o "guardar historia"), "imprimir odontograma", "guardar e imprimir".
      <br>• <em>Edición Rápida:</em> "limpiar todo", "borrar" (vuelve a colocar el diente seleccionado en estado Sano).
    </li>
  </ul>`;



  constructor(
    private odontogramaService: OdontogramaService,
    private appointmentService: AppointmentService,
    public staffService: StaffService,
    public router: Router,
    public ativatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    private toastr: ToastrService   // 🔥 Inyectado para alertas amigables
  ) {
    this.inicializarMapaDientes();
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
      // 1. Buscamos primero los datos de la cita para obtener el patient_id real
      this.obtenerDatosCita();
    });

    // 2. Encendemos el motor de los AirPods / Reconocimiento de Voz
    this.initSpeechRecognition();
  }

  getUserRemoto(): void {
    if (!this.user?.id) return;
    this.staffService.getUser(this.user.id).subscribe((resp: any) => {
      this.doctor = resp.user;
    });
  }

  /**
   * Genera la lista de los 32 dientes adultos bajo el sistema internacional FDI
   */
  inicializarMapaDientes() {
  // Ponemos los 32 números oficiales del sistema universal FDI en un solo arreglo plano
  const todosLosDientes = [
    // MAXILAR SUPERIOR (Cuadrantes 1 y 2)
    18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
    // MANDÍBULA INFERIOR (Cuadrantes 4 y 3)
    48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38
  ];

  this.odontogramaMapa = [];
  
  todosLosDientes.forEach(num => {
    this.odontogramaMapa.push({
      numero: num,
      hallazgo: 'Sano',
      cara_o: 'Sano', 
      cara_m: 'Sano', 
      cara_d: 'Sano', 
      cara_v: 'Sano', 
      cara_l: 'Sano'
    });
  });
}

   obtenerDatosCita() {
    this.isLoading = true
    this.appointmentService.showAppointment(this.appointment_id).subscribe((resp: any) => {
      console.log(resp);
      this.appointment_selected = resp.appointment;
      this.patient_id = resp.appointment.patient_id;
      this.name = this.appointment_selected.patient.name;
      this.surname = this.appointment_selected.patient.surname;
      this.n_doc = this.appointment_selected.patient.n_doc;
      this.phone = this.appointment_selected.patient.phone;
      this.name_companion = this.appointment_selected.patient.name_companion;
      this.surname_companion = this.appointment_selected.patient.surname_companion;
      this.mobile_companion = this.appointment_selected.patient.mobile_companion;
      this.addressconsultorio = this.appointment_selected.consultorio.address;
      this.name_consultorio = this.appointment_selected.consultorio.name_consultorio;
      this.antecedent_alerg = this.appointment_selected.patient.antecedent_alerg;
      this.getOdotogramaByPatient();
      this.isLoading = false
    });
    
   

  }

  
  getOdotogramaByPatient() {
    if (!this.patient_id) return;
    
    // Le pasamos el patient_id al servicio para traer lo guardado en Laravel/Supabase
    this.odontogramaService.lisFiterByPatient(this.patient_id).subscribe((resp: any) => {
      if (resp && resp.status === 'success' && resp.data) {
        // Pintamos en la pantalla los hallazgos que el paciente ya traía de citas anteriores
        resp.data.forEach((itemGuardado: any) => {
          const diente = this.odontogramaMapa.find(d => d.numero === itemGuardado.diente_numero);
          if (diente) {
            diente.hallazgo = itemGuardado.hallazgo;
            if (itemGuardado.cara_diente) {
              this.actualizarCaraDienteMemoria(diente, itemGuardado.cara_diente, itemGuardado.hallazgo);
            }
          }
        });
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * Inicializa los AirPods y configura el procesamiento inteligente de la voz dental
   */
  initSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window)) {
      console.warn("Este navegador no soporta reconocimiento de voz nativo.");
      return;
    }

    this.recognition = new webkitSpeechRecognition();
    this.recognition.continuous = true; // No se apaga mientras el odontólogo examina
    this.recognition.interimResults = false;
    this.recognition.lang = 'es-ES'; // Idioma español latino/españa

    // 🟢 EL ARREGLO CONTRA EL APAGADO AUTOMÁTICO EN IOS:

    this.recognition.onstart = () => {
      this.zone.run(() => this.isListening = true);
    };

    this.recognition.onend = () => {
      this.zone.run(() => {
        // Si el motor se apaga solo pero el switch físico en la pantalla sigue ENCENDIDO,
        // significa que iOS cortó el micrófono por inactividad. ¡Lo encendemos de nuevo al instante!
        if (this.isListening) {
          console.log('🔄 Reencendiendo micrófono automáticamente para evitar el apagado de iOS...');
          try {
            this.recognition.start();
          } catch (e) {
            // Evitamos saturar la consola si el motor ya estaba intentando arrancar
            console.log('Intento de reencendido ignorado por ejecución activa.');
          }
        } else {
          // Si el médico lo apagó a propósito por el switch, se queda apagado de verdad
          this.isListening = false;
        }
      });
    };
    // 🟢 EL ARREGLO CONTRA EL APAGADO AUTOMÁTICO EN IOS- fin

    // this.recognition.onstart = () => {
    //   this.zone.run(() => this.isListening = true);
    // };

    // this.recognition.onend = () => {
    //   this.zone.run(() => this.isListening = false);
    // };

    this.recognition.onresult = (event: any) => {
      const resultIndex = event.resultIndex;
      const rawText = event.results[resultIndex][0].transcript;
      
      this.procesarDictadoDental(rawText);
    };
  }

  // toggleEscucha() {
  //   if (this.isListening) {
  //     this.recognition.stop();
  //   } else {
  //     this.recognition.start();
  //   }
  // }


  toggleDictado(event: any) {
  this.isListening = event.target.checked;

  if (!this.recognition) {
    // Usamos el Toastr para que no se vea un alert rústico en el teléfono
    this.toastr.warning('Tu dispositivo o navegador actual no admite dictado por voz.', 'No Soportado');
    event.target.checked = false;
    this.isListening = false;
    return;
  }

  if (this.isListening) {
    // 🔥 EL DETONANTE SEGURO PARA IOS PWA:
    // Solicitamos acceso directo al chorro de audio del hardware. Esto obliga a Safari
    // a levantar el cartel flotante de "Klyntic desea acceder al micrófono" pase lo que pase.
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          // Permiso concedido por el médico: procedemos a apagar el stream temporal 
          // para liberar el micrófono y encendemos el motor de reconocimiento avanzado
          stream.getTracks().forEach(track => track.stop());
          
          // Encendemos el motor nativo que procesa tus comandos en es-VE
          this.recognition.start();
          console.log('🎙️ Motor de dictado Klyntic iniciado con éxito.');
        })
        .catch((err) => {
          console.error('El iPhone rechazó el micrófono:', err);
          this.toastr.error('Debes permitir el acceso al micrófono en los ajustes de Safari para dictar.', 'Permiso Denegado');
          event.target.checked = false;
          this.isListening = false;
          this.cdr.detectChanges(); // Forzamos a Angular 19 a pintar el switch apagado
        });
    } else {
      // Si el navegador es sumamente viejo y no tiene mediaDevices, intentamos el arranque directo
      this.recognition.start();
    }
  } else {
    // Si el médico apaga el switch, detenemos el motor ordenadamente
    this.recognition.stop();
  }
}
  

  /**
   * Parsea de forma inteligente el comando (Ej: "diente catorce caries en oclusal")
   */
  procesarDictadoDental(rawText: string) {
    const texto = rawText.toLowerCase().trim();
    console.log("Audio capturado en AirPods:", texto);

    // Extraemos el número del diente
    const encontrarNumeros = texto.match(/\d+/g);
    if (!encontrarNumeros) return;

    const numeroDiente = parseInt(encontrarNumeros[0], 10);
    let hallazgo = '';
    let cara = '';

    // 1. Filtro inteligente de caras del diente
    if (texto.includes('oclusal')) cara = 'O';
    else if (texto.includes('mesial')) cara = 'M';
    else if (texto.includes('distal')) cara = 'D';
    else if (texto.includes('vestibular')) cara = 'V';
    else if (texto.includes('lingual')) cara = 'L';
    else if (texto.includes('palatina')) cara = 'P';

    // 2. Filtro inteligente de diagnósticos odontológicos (Soporta sinónimos comunes)
    if (texto.includes('caries')) hallazgo = 'Caries';
    else if (texto.includes('ausente') || texto.includes('falta')) hallazgo = 'Ausente';
    else if (texto.includes('resina') || texto.includes('calza') || texto.includes('obturado')) hallazgo = 'Resina';
    else if (texto.includes('corona')) hallazgo = 'Corona';
    else if (texto.includes('endodoncia') || texto.includes('conducto')) hallazgo = 'Endodoncia';
    else if (texto.includes('sano') || texto.includes('limpio')) hallazgo = 'Sano';

    // 3. Si capturamos un diente FDI válido y un hallazgo médico, guardamos
    if (numeroDiente >= 11 && numeroDiente <= 48 && hallazgo !== '') {
      this.zone.run(() => {
        this.guardarHallazgoEnServidor(numeroDiente, cara, hallazgo);
      });
    }
  }

  guardarHallazgoEnServidor(dienteNum: number, cara: string, hallazgo: string) {
    const payload = {
      patient_id: this.patient_id,
      appointment_id: this.appointment_id,
      doctor_id: this.doctor_id,
      diente_numero: dienteNum,
      cara_diente: cara || null,
      hallazgo: hallazgo,
      notas: 'Registrado vía asistente de voz'
    };

    // Enviamos el post directo a tu backend de Laravel (Fase 2)
    this.odontogramaService.guardarDiente(payload).subscribe((resp: any) => {
      if (resp && resp.status === 'success') {
        // Buscamos el diente en memoria y lo actualizamos para pintar la pantalla de inmediato
        const diente = this.odontogramaMapa.find(d => d.numero === dienteNum);
        if (diente) {
          if (!cara) {
            diente.hallazgo = hallazgo; // Estado general del diente
          } else {
            this.actualizarCaraDienteMemoria(diente, cara, hallazgo);
          }
          this.cdr.detectChanges();
          this.reproducirBeepOk(); // Confirmación sonora para los AirPods
        }
      }
    });
  }

  actualizarCaraDienteMemoria(diente: Diente, cara: string, hallazgo: string) {
    if (cara === 'O') diente.cara_o = hallazgo;
    if (cara === 'M') diente.cara_m = hallazgo;
    if (cara === 'D') diente.cara_d = hallazgo;
    if (cara === 'V') diente.cara_v = hallazgo;
    if (cara === 'L' || cara === 'P') diente.cara_l = hallazgo;
  }

  // Devuelve true si el paciente tiene al menos un diente con problemas
tieneHallazgos(): boolean {
  return this.odontogramaMapa.some(diente => diente.hallazgo !== 'Sano');
}

  /**
   * Emite un tono electrónico suave para avisar al odontólogo que el diente se guardó
   */
  reproducirBeepOk() {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // Tono agradable agudo
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime); // Volumen suave para no aturdir

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1); // Solo dura 100 milisegundos
    } catch (e) {
      console.error("No se pudo reproducir el beep de voz:", e);
    }
  }


  imprimirOdontograma() {
     const logoBase64 = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDE3OC40IDIxNy42IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxNzguNCAyMTcuNjsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOnVybCgjU1ZHSURfMV8pO30KCS5zdDF7ZmlsbDojRkZGRkZGO30KCS5zdDJ7ZmlsbDojNzM2MEE5O30KPC9zdHlsZT4KPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF8xXyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSI5MC40MjY1IiB5MT0iMTM3LjY2IiB4Mj0iOTAuNDI2NSIgeTI9Ii0xNi42MSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgxIDAgMCAtMSAwIDIyNikiPgoJPHN0b3Agb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojNkE0RUEwIj48L3N0b3A+Cgk8c3RvcCBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOiMyNjIyNjIiPjwvc3RvcD4KPC9saW5lYXJHcmFkaWVudD4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTM2LjUsOS40aDEwNy45YzEyLjgsMCwyMy4yLDEwLjQsMjMuMiwyMy4ydjExMS42YzAsMTIuOC0xMC40LDIzLjItMjMuMiwyMy4ySDM2LjUgIGMtMTIuOCwwLTIzLjItMTAuNC0yMy4yLTIzLjJWMzIuNUMxMy4zLDE5LjcsMjMuNyw5LjQsMzYuNSw5LjR6Ij48L3BhdGg+CjxnPgoJPHBhdGggY2xhc3M9InN0MSIgZD0iTTEzMC41LDM2LjNoLTgxYy0xMCwwLTExLjksMTEuMy0xMS45LDExLjN2NDcuMWMwLDAtMC43LDEzLjYsMTIuMywxMy42aDYxLjNWOTMuNGMwLDAsMTcuMS01LjIsMTcuMS0xOVY1NC4xICAgaC05di0zLjloLTYuNHYxMi45aDYuMXYtMy4yaDIuNnYxNi41YzAsMC0xLDkuMi0xMi4zLDkuMmMtMTEuOSwwLTEzLjktMTAuMi0xMy45LTEwLjJWNTkuNWgyLjN2NC4yaDUuOFY1MC4yaC01Ljh2My41aC04LjcgICBjMCwwLTAuMywxMy42LDAsMjAuN2MxLjYsMTQuMiwxNi41LDE4LjEsMTYuNSwxOC4xdjkuNGMwLDAtNDkuNCwwLjctNTUuNSwwYy02LjEtMC43LTUuNS01LjItNS41LTUuMlY0OC4yYzAsMCwwLjMtNS44LDYuMS01LjggICBzNzMuOS0wLjMsODAuNywwYzYuOCwwLjMsNS44LDcuNCw1LjgsNy40djYzLjloLTM2LjVMODMuNSwxMzBjLTIuMS0xLjUtNC42LTIuNC03LjQtMi40Yy03LDAtMTIuNyw1LjctMTIuNywxMi43ICAgUzY5LjEsMTUzLDc2LjEsMTUzczEyLjctNS43LDEyLjctMTIuN2MwLTIuMS0wLjUtNC4xLTEuNC01LjhsMTUuNi0xNWg0MC4zVjQ3QzE0My4zLDQ3LDE0My42LDM2LjMsMTMwLjUsMzYuM0wxMzAuNSwzNi4zeiAgICBNNzYuMSwxNDguN2MtNC42LDAtOC40LTMuOC04LjQtOC40czMuOC04LjQsOC40LTguNHM4LjQsMy44LDguNCw4LjRTODAuOCwxNDguNyw3Ni4xLDE0OC43eiI+PC9wYXRoPgoJPGVsbGlwc2UgY2xhc3M9InN0MSIgY3g9IjU4LjkiIGN5PSI3MiIgcng9IjQuNSIgcnk9IjcuNiI+PC9lbGxpcHNlPgoJPGVsbGlwc2UgY2xhc3M9InN0MSIgY3g9Ijc2LjEiIGN5PSI3MiIgcng9IjQuNSIgcnk9IjcuNiI+PC9lbGxpcHNlPgoJPGNpcmNsZSBjbGFzcz0ic3QxIiBjeD0iNzYuMSIgY3k9IjE0MC4zIiByPSI0LjUiPjwvY2lyY2xlPgo8L2c+CjxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik0xMzAuNSwzNi4zaC04MWMtMTAsMC0xMS45LDExLjMtMTEuOSwxMS4zdjQ3LjFjMCwwLTAuNywxMy42LDEyLjMsMTMuNmg2MS4zVjkzLjRjMCwwLDE3LjEtNS4yLDE3LjEtMTlWNTQuMSAgaC05di0zLjloLTYuNHYxMi45aDYuMXYtMy4yaDIuNnYxNi41YzAsMC0xLDkuMi0xMi4zLDkuMmMtMTEuOSwwLTEzLjktMTAuMi0xMy45LTEwLjJWNTkuNWgyLjN2NC4yaDUuOFY1MC4yaC01Ljh2My41aC04LjcgIGMwLDAtMC4zLDEzLjYsMCwyMC43YzEuNiwxNC4yLDE2LjUsMTguMSwxNi41LDE4LjF2OS40YzAsMC00OS40LDAuNy01NS41LDBjLTYuMS0wLjctNS41LTUuMi01LjUtNS4yVjQ4LjJjMCwwLDAuMy01LjgsNi4xLTUuOCAgczczLjktMC4zLDgwLjcsMGM2LjgsMC4zLDUuOCw3LjQsNS44LDcuNHY2My45aC0zNi41TDgzLjUsMTMwYy0yLjEtMS41LTQuNi0yLjQtNy40LTIuNGMtNywwLTEyLjcsNS43LTEyLjcsMTIuN1M2OS4xLDE1Myw3Ni4xLDE1MyAgczEyLjctNS43LDEyLjctMTIuN2MwLTIuMS0wLjUtNC4xLTEuNC01LjhsMTUuNi0xNWg0MC4zVjQ3QzE0My4zLDQ3LDE0My42LDM2LjMsMTMwLjUsMzYuM0wxMzAuNSwzNi4zeiBNNzYuMSwxNDguNyAgYy00LjYsMC04LjQtMy44LTguNC04LjRzMy44LTguNCw4LjQtOC40czguNCwzLjgsOC40LDguNFM4MC44LDE0OC43LDc2LjEsMTQ4Ljd6Ij48L3BhdGg+CjxlbGxpcHNlIGNsYXNzPSJzdDEiIGN4PSI5MC40IiBjeT0iNzIiIHJ4PSI0LjUiIHJ5PSI3LjYiPjwvZWxsaXBzZT4KPGVsbGlwc2UgY2xhc3M9InN0MSIgY3g9IjkwLjQiIGN5PSI3MiIgcng9IjQuNSIgcnk9IjcuNiI+PC9lbGxpcHNlPgo8Y2lyY2xlIGNsYXNzPSJzdDEiIGN4PSI5MC40IiBjeT0iMTQwLjMiIHI9IjQuNSI+PC9jaXJjbGU+CjxnPgoJPGc+CgkJPHBhdGggY2xhc3M9InN0MiIgZD0iTTI1LjQsMTk1bDguNC05LjZoOC41bC0xMC42LDExLjFsMTEuNiwxMi4zaC05bC05LTEwLjF2MTAuMWgtNi45di0yMy40aDYuOVYxOTV6Ij48L3BhdGg+CgkJPHBhdGggY2xhc3M9InN0MiIgZD0iTTUyLDE4NS40djE4LjJoOC4zdjUuMUg0NXYtMjMuNEg1MnoiPjwvcGF0aD4KCQk8cGF0aCBjbGFzcz0ic3QyIiBkPSJNNjYuMiwxOTcuNWwtOS43LTEyLjFoOC4zbDQuOSw2LjRsNC45LTYuNGg4LjNsLTkuOCwxMi4xdjExLjJoLTYuOVYxOTcuNXoiPjwvcGF0aD4KCQk8cGF0aCBjbGFzcz0ic3QyIiBkPSJNODMuOSwyMDguN3YtMjMuNGg2LjlsMTIuOCwxNC4zdi0xNC4zaDYuOXYyMy40aC02LjlsLTEyLjgtMTQuM3YxNC4zSDgzLjl6Ij48L3BhdGg+CgkJPHBhdGggY2xhc3M9InN0MiIgZD0iTTEyNC43LDE5MC41djE4LjJoLTYuOXYtMTguMmgtNS43di01LjFoMTguM3Y1LjFIMTI0Ljd6Ij48L3BhdGg+CgkJPHBhdGggY2xhc3M9InN0MiIgZD0iTTEzOSwxODUuNHYyMy40aC02Ljl2LTIzLjRIMTM5eiI+PC9wYXRoPgoJCTxwYXRoIGNsYXNzPSJzdDIiIGQ9Ik0xNjIuNCwxOTMuMmMtMS42LTEuNy0zLjYtMi42LTUuOS0yLjZjLTEsMC0yLDAuMi0yLjksMC41Yy0wLjksMC4zLTEuNiwwLjgtMi4zLDEuM3MtMS4xLDEuMi0xLjUsMiAgICBjLTAuNCwwLjgtMC41LDEuNi0wLjUsMi41YzAsMC45LDAuMiwxLjgsMC41LDIuNmMwLjQsMC44LDAuOSwxLjUsMS41LDJjMC42LDAuNiwxLjQsMSwyLjMsMS40YzAuOSwwLjMsMS44LDAuNSwyLjgsMC41ICAgIGMyLjIsMCw0LjItMC44LDYtMi41djcuMmwtMC43LDAuMmMtMS4xLDAuMy0yLDAuNi0zLDAuN2MtMC45LDAuMi0xLjgsMC4yLTIuNywwLjJjLTEuOCwwLTMuNi0wLjMtNS4zLTAuOXMtMy4yLTEuNS00LjUtMi42ICAgIGMtMS4zLTEuMS0yLjMtMi40LTMuMS0zLjljLTAuOC0xLjUtMS4yLTMuMi0xLjItNXMwLjQtMy40LDEuMS00LjlzMS44LTIuOCwzLjEtMy45YzEuMy0xLjEsMi44LTEuOSw0LjUtMi41ICAgIGMxLjctMC42LDMuNS0wLjksNS4zLTAuOWMxLjEsMCwyLjEsMC4xLDMuMSwwLjNzMi4xLDAuNSwzLjIsMC45VjE5My4yeiI+PC9wYXRoPgoJPC9nPgo8L2c+Cjwvc3ZnPgo=';
  // Crear una ventana flotante limpia para la impresión
  const ventanaImpresion = window.open('', '_blank', 'width=800,height=600');

  // =========================================================================
  // 🦷 GENERACIÓN DE LA LISTA DE HALLAZGOS DENTALES PARA LA IMPRESIÓN
  // =========================================================================
  // Filtramos el arreglo de memoria para extraer solo los dientes que NO estén sanos
  const dientesConHallazgos = this.odontogramaMapa.filter(d => d.hallazgo !== 'Sano');

  // Mapeamos las piezas enfermas o tratadas para inyectarlas en una tabla HTML limpia
  const filasOdontogramaHTML = dientesConHallazgos.length > 0
    ? dientesConHallazgos.map(diente => `
    <tr style="border-bottom: 1px dashed #eee;">
      <td style="padding: 10px; font-weight: bold; color: #333;">Pieza Dental (FDI): Diente ${diente.numero}</td>
      <td style="padding: 10px;">
        <span style="
          display: inline-block;
          padding: 4px 10px;
          font-size: 13px;
          font-weight: bold;
          border-radius: 4px;
          color: #fff;
          background-color: ${
            diente.hallazgo === 'Caries' ? '#dc3545 !important' : 
            diente.hallazgo === 'Resina' ? '#0d6efd !important' : 
            diente.hallazgo === 'Ausente' ? '#6c757d !important' : '#ffc107 !important'
          };
          ${diente.hallazgo === 'Corona' || diente.hallazgo === 'Endodoncia' ? 'color: #212529;' : ''}
        ">
          ${diente.hallazgo}
        </span>
      </td>
    </tr>
  `).join('')
    : `<tr><td colspan="2" style="padding: 20px; text-align: center; color: #777; font-style: italic;">No se registraron hallazgos patológicos. Toda la dentición se encuentra clínicamente sana.</td></tr>`;

  if (ventanaImpresion) {
    // Nota: Asegúrate de que 'logoBase64' esté disponible en tu componente, tal como lo tenías en el récipe
    const logoSrc = (typeof logoBase64 !== 'undefined') ? logoBase64 : '';

    ventanaImpresion.document.write(`
    <html>
      <head>
        <title>Reporte de Odontograma - Klyntic</title>
        <style>
          body { 
          font-family: Arial, sans-serif; 
          padding: 40px; 
          color: #333; 
          /* 🔥 Fuerza al navegador a renderizar colores en la impresión */
          -webkit-print-color-adjust: exact !important; 
          print-color-adjust: exact !important; 
        }
          
          /* Alineación corporativa de Klyntic */
          .header { 
            text-align: center; 
            border-bottom: 2px solid #0d6efd; 
            padding-bottom: 15px; 
          }
          .logo-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin-bottom: 5px;
          }
          .logoav { object-fit: contain; }
          
          .content { margin-top: 30px; font-size: 15px; line-height: 1.6; }
          .row-flex { display: flex; gap: 40px; margin-bottom: 25px; }
          .section { flex: 1; background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #e9ecef; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #ddd; padding-top: 10px; }
          h3 { color: #0d6efd; margin-top: 0; margin-bottom: 10px; border-bottom: 1px solid #dee2e6; padding-bottom: 5px; font-size: 16px; }
          p { margin: 4px 0; color: #495057; }
          
          /* Estilos de la tabla de hallazgos */
          .tabla-odontograma { width: 100%; border-collapse: collapse; margin-top: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
          .th-head { background-color: #f1f3f5; text-align: left; padding: 10px; color: #495057; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-container">
            ${logoSrc ? `<img class="logoav" src="${logoSrc}" width="45" height="45" alt="Klyntic Logo">` : ''}
            <h2>REPORTE DE ODONTOGRAMA</h2>
          </div>
          <p style="margin: 0; color: #555; font-weight: bold;">Klyntic Medical Intelligent System</p>
        </div>
        
        <div class="content">
          <!-- Bloque de datos del Profesional y de la Clínica -->
          <div class="row-flex">
            <div class="section">
              <h3>Odontólogo Especialista</h3>
              <p style="white-space: pre-wrap;">Dr(a).${this.doctor.name} ${this.doctor.surname}</p>
              <p style="white-space: pre-wrap;">Teléfono: ${this.doctor.mobile}</p>
            </div>
            <div class="section">
              <h3>Ubicación del Consultorio</h3>
              <p style="white-space: pre-wrap;">Consultorio: ${this.name_consultorio}</p>
              <p style="white-space: pre-wrap;">Dirección: ${this.addressconsultorio}</p>
            </div>
          </div>

          <!-- Tabla de Resumen Clínico del Mapa de la Boca -->
          <div style="margin-top: 30px;">
            <h3 style="color: #0d6efd; border-bottom: 2px solid #0d6efd; padding-bottom: 5px;">Diagnóstico y Plan de Tratamiento</h3>
            <table class="tabla-odontograma">
              <thead>
                <tr>
                  <th class="th-head">Pieza Dental Seleccionada</th>
                  <th class="th-head">Hallazgo Clínico Registrado</th>
                </tr>
              </thead>
              <tbody>
                <!-- 🎯 INYECCIÓN EN TIEMPO REAL DE LAS FILAS DEL ODONTOGRAMA -->
                ${filasOdontogramaHTML}
              </tbody>
            </table>
          </div>
        </div>
        
        <div class="footer">
          <p>Reporte de odontograma generado digitalmente de forma automatizada por el Asistente de Voz de Klyntic.</p>
          <p style="font-size: 10px; color: #aaa;">Fecha de impresión: ${new Date().toLocaleString()}</p>
        </div>
      </body>
    </html>
  `);

    ventanaImpresion.document.close();
    ventanaImpresion.focus();

    // Pequeño retraso de 250ms para garantizar el renderizado del buffer de impresión
    setTimeout(() => {
      ventanaImpresion.print();
      ventanaImpresion.close();
    }, 250);
  }
}

}
