import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PatientMService } from '../../../services/patient-m.service';
import { DoctorService } from '../../../services/doctor.service';
import { environment } from '../../../../environments/environment';
import { routes } from '../../../shared/routes/routes';
import { StaffService } from '../../../services/staff.service';
import { RLaboratoryService } from '../../../services/rlaboratory.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Speciality } from '../../../models/speciality.model';
import { User } from '../../../models/user.model';
@Component({
    selector: 'app-profile-patient-m',
    templateUrl: './profile-patient-m.component.html',
    styleUrls: ['./profile-patient-m.component.scss'],
    standalone: false
})
export class ProfilePatientMComponent {
  public routes = routes;
  imagenSerUrl = environment.url_media;
  public patientProfile: any[];
  option_selected = 1;
  public patient_id: any;
  public roles: any;
  public user: any;
  isLoading = false;

  public num_appointment = 0;
  public money_of_appointments = 0;
  public num_appointment_pendings = 0;
  public patient_selected: any;
  public appointment_pendings: any = [];
  public appointments: any = [];
  public vacunas: any = [];
  public evolucion: any = [];
  doctor:User;
  speciality:Speciality;
  public text_success = '';
  public text_validation = '';

  public rlaboratories_list: any[] = [];
  public file_selected: any;

  constructor(
    public patientService: PatientMService,
    public activatedRoute: ActivatedRoute,
    public doctorService: DoctorService,
    private staffService: StaffService,
    public rlaboratoryService: RLaboratoryService,
    private _sanitizer: DomSanitizer,
  ) {
  }
  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.doctorService.closeMenuSidebar();
    this.activatedRoute.params.subscribe((resp: any) => {
      // console.log(resp);
      this.patient_id = resp.id;
    });
    const USER = localStorage.getItem('user');
    this.user = JSON.parse(USER ? USER : '');
    this.roles = this.user.roles[0];
    this.getPatient();
    this.getUserRemoto();
    
  }

  getUserRemoto(): void {
    if (!this.user?.id) return;
    this.staffService.getUser(this.user.id).subscribe((resp: any) => {
      this.doctor = resp.user;
      this.speciality = this.doctor.speciality
    });
  }

 
  isPermission(permission: string) {
    if (this.user.roles.includes('SUPERADMIN')) {
      return true;
    }
    if (this.user.permissions.includes(permission)) {
      return true;
    }
    return false;
  }

  getPatient() {
    this.isLoading = true;
    this.patientService.showPatientProfile(this.patient_id).subscribe((resp: any) => {
      this.appointments = resp.appointments;
      this.num_appointment = resp.num_appointment;
      this.money_of_appointments = resp.money_of_appointments;
      this.num_appointment_pendings = resp.num_appointment_pendings;
      this.patient_selected = resp.patient;
      this.appointment_pendings = resp.appointment_pendings.data;
      this.vacunas = resp.patient.vacunas;
      this.evolucion = resp.patient.evolucion;
      this.isLoading = false;

    })
    this.getResportes();
  }

   getResportes() {
    this.isLoading = true;
    this.rlaboratoryService.getRLaboratoryByPatient(this.patient_id).subscribe((resp: any) => {
      this.rlaboratories_list = resp.laboratories.data;
      this.isLoading = false;
    });
  }

  selectDoc(FILE: any) {
    this.file_selected = FILE;
  }

  getDocumentIframe(url: any) {
  if (url === null || url === undefined) {
    return '';
  }

  // 1. SI ES UN ARCHIVO BINARIO LOCAL (En cola para subirse por primera vez)
  if (url instanceof File) {
    const localBlobUrl = URL.createObjectURL(url);
    // Envolvemos obligatoriamente la URL temporal en bypassSecurityTrustResourceUrl
    return this._sanitizer.bypassSecurityTrustResourceUrl(localBlobUrl);
  }

  // 2. SI ES UNA URL EN STRING (Historial de Cloudinary que viene de Laravel)
  if (typeof url === 'string') {
    let documentUrl = url;
    let results = url.match('[\\?&]v=([^&#]*)');
    if (results !== null) {
      documentUrl = results[1];
    }
    
    // Forzamos a Angular a confiar en la URL externa de Cloudinary para el visor embed
    return this._sanitizer.bypassSecurityTrustResourceUrl(documentUrl);
  }

  return '';
}



  optionSelected(value: number) {
    this.option_selected = value;
  }

  imprimirHistoria() {
    const logoBase64 = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDE3OC40IDIxNy42IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxNzguNCAyMTcuNjsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOnVybCgjU1ZHSURfMV8pO30KCS5zdDF7ZmlsbDojRkZGRkZGO30KCS5zdDJ7ZmlsbDojNzM2MEE5O30KPC9zdHlsZT4KPGxpbmVhckdyYWRpZW50IGlkPSJTVkdJRF8xXyIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSI5MC40MjY1IiB5MT0iMTM3LjY2IiB4Mj0iOTAuNDI2NSIgeTI9Ii0xNi42MSIgZ3JhZGllbnRUcmFuc2Zvcm09Im1hdHJpeCgxIDAgMCAtMSAwIDIyNikiPgoJPHN0b3Agb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojNkE0RUEwIj48L3N0b3A+Cgk8c3RvcCBvZmZzZXQ9IjEiIHN0eWxlPSJzdG9wLWNvbG9yOiMyNjIyNjIiPjwvc3RvcD4KPC9saW5lYXJHcmFkaWVudD4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTM2LjUsOS40aDEwNy45YzEyLjgsMCwyMy4yLDEwLjQsMjMuMiwyMy4ydjExMS42YzAsMTIuOC0xMC40LDIzLjItMjMuMiwyMy4ySDM2LjUgIGMtMTIuOCwwLTIzLjItMTAuNC0yMy4yLTIzLjJWMzIuNUMxMy4zLDE5LjcsMjMuNyw5LjQsMzYuNSw5LjR6Ij48L3BhdGg+CjxnPgoJPHBhdGggY2xhc3M9InN0MSIgZD0iTTEzMC41LDM2LjNoLTgxYy0xMCwwLTExLjksMTEuMy0xMS45LDExLjN2NDcuMWMwLDAtMC43LDEzLjYsMTIuMywxMy42aDYxLjNWOTMuNGMwLDAsMTcuMS01LjIsMTcuMS0xOVY1NC4xICAgaC05di0zLjloLTYuNHYxMi45aDYuMXYtMy4yaDIuNnYxNi41YzAsMC0xLDkuMi0xMi4zLDkuMmMtMTEuOSwwLTEzLjktMTAuMi0xMy45LTEwLjJWNTkuNWgyLjN2NC4yaDUuOFY1MC4yaC01Ljh2My41aC04LjcgICBjMCwwLTAuMywxMy42LDAsMjAuN2MxLjYsMTQuMiwxNi41LDE4LjEsMTYuNSwxOC4xdjkuNGMwLDAtNDkuNCwwLjctNTUuNSwwYy02LjEtMC43LTUuNS01LjItNS41LTUuMlY0OC4yYzAsMCwwLjMtNS44LDYuMS01LjggICBzNzMuOS0wLjMsODAuNywwYzYuOCwwLjMsNS44LDcuNCw1LjgsNy40djYzLjloLTM2LjVMODMuNSwxMzBjLTIuMS0xLjUtNC42LTIuNC03LjQtMi40Yy03LDAtMTIuNyw1LjctMTIuNywxMi43ICAgUzY5LjEsMTUzLDc2LjEsMTUzczEyLjctNS43LDEyLjctMTIuN2MwLTIuMS0wLjUtNC4xLTEuNC01LjhsMTUuNi0xNWg0MC4zVjQ3QzE0My4zLDQ3LDE0My42LDM2LjMsMTMwLjUsMzYuM0wxMzAuNSwzNi4zeiAgICBNNzYuMSwxNDguN2MtNC42LDAtOC40LTMuOC04LjQtOC40czMuOC04LjQsOC40LTguNHM4LjQsMy44LDguNCw4LjRTODAuOCwxNDguNyw3Ni4xLDE0OC43eiI+PC9wYXRoPgoJPGVsbGlwc2UgY2xhc3M9InN0MSIgY3g9IjU4LjkiIGN5PSI3MiIgcng9IjQuNSIgcnk9IjcuNiI+PC9lbGxpcHNlPgoJPGVsbGlwc2UgY2xhc3M9InN0MSIgY3g9Ijc2LjEiIGN5PSI3MiIgcng9IjQuNSIgcnk9IjcuNiI+PC9lbGxpcHNlPgoJPGNpcmNsZSBjbGFzcz0ic3QxIiBjeD0iNzYuMSIgY3k9IjE0MC4zIiByPSI0LjUiPjwvY2lyY2xlPgo8L2c+CjxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik0xMzAuNSwzNi4zaC04MWMtMTAsMC0xMS45LDExLjMtMTEuOSwxMS4zdjQ3LjFjMCwwLTAuNywxMy42LDEyLjMsMTMuNmg2MS4zVjkzLjRjMCwwLDE3LjEtNS4yLDE3LjEtMTlWNTQuMSAgaC05di0zLjloLTYuNHYxMi45aDYuMXYtMy4yaDIuNnYxNi41YzAsMC0xLDkuMi0xMi4zLDkuMmMtMTEuOSwwLTEzLjktMTAuMi0xMy45LTEwLjJWNTkuNWgyLjN2NC4yaDUuOFY1MC4yaC01Ljh2My41aC04LjcgIGMwLDAtMC4zLDEzLjYsMCwyMC43YzEuNiwxNC4yLDE2LjUsMTguMSwxNi41LDE4LjF2OS40YzAsMC00OS40LDAuNy01NS41LDBjLTYuMS0wLjctNS41LTUuMi01LjUtNS4yVjQ4LjJjMCwwLDAuMy01LjgsNi4xLTUuOCAgczczLjktMC4zLDgwLjcsMGM2LjgsMC4zLDUuOCw3LjQsNS44LDcuNHY2My45aC0zNi41TDgzLjUsMTMwYy0yLjEtMS41LTQuNi0yLjQtNy40LTIuNGMtNywwLTEyLjcsNS43LTEyLjcsMTIuN1M2OS4xLDE1Myw3Ni4xLDE1MyAgczEyLjctNS43LDEyLjctMTIuN2MwLTIuMS0wLjUtNC4xLTEuNC01LjhsMTUuNi0xNWg0MC4zVjQ3QzE0My4zLDQ3LDE0My42LDM2LjMsMTMwLjUsMzYuM0wxMzAuNSwzNi4zeiBNNzYuMSwxNDguNyAgYy00LjYsMC04LjQtMy44LTguNC04LjRzMy44LTguNCw4LjQtOC40czguNCwzLjgsOC40LDguNFM4MC44LDE0OC43LDc2LjEsMTQ4Ljd6Ij48L3BhdGg+CjxlbGxpcHNlIGNsYXNzPSJzdDEiIGN4PSI5MC40IiBjeT0iNzIiIHJ4PSI0LjUiIHJ5PSI3LjYiPjwvZWxsaXBzZT4KPGVsbGlwc2UgY2xhc3M9InN0MSIgY3g9IjkwLjQiIGN5PSI3MiIgcng9IjQuNSIgcnk9IjcuNiI+PC9lbGxpcHNlPgo8Y2lyY2xlIGNsYXNzPSJzdDEiIGN4PSI5MC40IiBjeT0iMTQwLjMiIHI9IjQuNSI+PC9jaXJjbGU+CjxnPgoJPGc+CgkJPHBhdGggY2xhc3M9InN0MiIgZD0iTTI1LjQsMTk1bDguNC05LjZoOC41bC0xMC42LDExLjFsMTEuNiwxMi4zaC05bC05LTEwLjF2MTAuMWgtNi45di0yMy40aDYuOVYxOTV6Ij48L3BhdGg+CgkJPHBhdGggY2xhc3M9InN0MiIgZD0iTTUyLDE4NS40djE4LjJoOC4zdjUuMUg0NXYtMjMuNEg1MnoiPjwvcGF0aD4KCQk8cGF0aCBjbGFzcz0ic3QyIiBkPSJNNjYuMiwxOTcuNWwtOS43LTEyLjFoOC4zbDQuOSw2LjRsNC45LTYuNGg4LjNsLTkuOCwxMi4xdjExLjJoLTYuOVYxOTcuNXoiPjwvcGF0aD4KCQk8cGF0aCBjbGFzcz0ic3QyIiBkPSJNODMuOSwyMDguN3YtMjMuNGg2LjlsMTIuOCwxNC4zdi0xNC4zaDYuOXYyMy40aC02LjlsLTEyLjgtMTQuM3YxNC4zSDgzLjl6Ij48L3BhdGg+CgkJPHBhdGggY2xhc3M9InN0MiIgZD0iTTEyNC43LDE5MC41djE4LjJoLTYuOXYtMTguMmgtNS43di01LjFoMTguM3Y1LjFIMTI0Ljd6Ij48L3BhdGg+CgkJPHBhdGggY2xhc3M9InN0MiIgZD0iTTEzOSwxODUuNHYyMy40aC02Ljl2LTIzLjRIMTM5eiI+PC9wYXRoPgoJCTxwYXRoIGNsYXNzPSJzdDIiIGQ9Ik0xNjIuNCwxOTMuMmMtMS42LTEuNy0zLjYtMi42LTUuOS0yLjZjLTEsMC0yLDAuMi0yLjksMC41Yy0wLjksMC4zLTEuNiwwLjgtMi4zLDEuM3MtMS4xLDEuMi0xLjUsMiAgICBjLTAuNCwwLjgtMC41LDEuNi0wLjUsMi41YzAsMC45LDAuMiwxLjgsMC41LDIuNmMwLjQsMC44LDAuOSwxLjUsMS41LDJjMC42LDAuNiwxLjQsMSwyLjMsMS40YzAuOSwwLjMsMS44LDAuNSwyLjgsMC41ICAgIGMyLjIsMCw0LjItMC44LDYtMi41djcuMmwtMC43LDAuMmMtMS4xLDAuMy0yLDAuNi0zLDAuN2MtMC45LDAuMi0xLjgsMC4yLTIuNywwLjJjLTEuOCwwLTMuNi0wLjMtNS4zLTAuOXMtMy4yLTEuNS00LjUtMi42ICAgIGMtMS4zLTEuMS0yLjMtMi40LTMuMS0zLjljLTAuOC0xLjUtMS4yLTMuMi0xLjItNXMwLjQtMy40LDEuMS00LjlzMS44LTIuOCwzLjEtMy45YzEuMy0xLjEsMi44LTEuOSw0LjUtMi41ICAgIGMxLjctMC42LDMuNS0wLjksNS4zLTAuOWMxLjEsMCwyLjEsMC4xLDMuMSwwLjNzMi4xLDAuNSwzLjIsMC45VjE5My4yeiI+PC9wYXRoPgoJPC9nPgo8L2c+Cjwvc3ZnPgo=';
    const ventanaImpresion = window.open('', '_blank', 'width=800,height=600');


    if (ventanaImpresion) {

        // ==========================================
  // PARTE 1: PROCESAR LOGICA DE ARREGLOS ARRIBA
  // ==========================================

  // A. Procesar Vacunas (Solo Pediatría)
  let bloqueVacunas = '';
  if (this.doctor && this.doctor.speciality?.name === 'Pediatría') {
    let filasVacunas = '';
    if (this.vacunas && this.vacunas.length > 0) {
      filasVacunas = this.vacunas.map(item => `
        <tr>
          <td>${item.name_medical || ''}</td>
          <td style="text-align: center;">${item.cantidad || ''}</td>
          <td style="text-align: center;">${item.fecha_vacuna ? new Date(item.fecha_vacuna).toLocaleDateString('es-ES') : ''}</td>
        </tr>
      `).join('');
    }
    bloqueVacunas = `
      <div class="section-title">4. Esquema de Vacunación (Pediatría)</div>
      ${filasVacunas === '' ? '<div class="text-block" style="color: #666; font-style: italic;">No se registran vacunas.</div>' : `
        <table class="clinical-table">
          <thead><tr><th>Descripción</th><th style="width:80px;text-align:center">Cantidad</th><th style="width:120px;text-align:center">Fecha</th></tr></thead>
          <tbody>${filasVacunas}</tbody>
        </table>
      `}
    `;
  }

  // B. Procesar Reporte Laboratorio
  let filasLaboratorio = '';
  if (this.rlaboratories_list && this.rlaboratories_list.length > 0) {
    filasLaboratorio = this.rlaboratories_list.map(lab => `
      <tr>
        <td>${lab.comentario || ''}</td>
        <td style="color: #3182ce;">📁 ${lab.name_file || 'archivo.jpg'}</td>
      </tr>
    `).join('');
  }
  let bloqueLaboratorio = `
    <div class="section-title">5. Reportes de Laboratorio</div>
    ${filasLaboratorio === '' ? '<div class="text-block" style="color: #666; font-style: italic;">No se registran exámenes.</div>' : `
      <table class="clinical-table">
        <thead><tr><th>Descripción del Examen</th><th style="width:180px">Adjuntos</th></tr></thead>
        <tbody>${filasLaboratorio}</tbody>
      </table>
    `}
  `;

    // C. Procesar Evolución Clínica
    let filasEvolucion = '';
    if (this.evolucion && this.evolucion.length > 0) {
      filasEvolucion = this.evolucion.map(evo => `
        <tr>
          <td>${evo.name_evolucion || ''}</td>
          <td style="text-align: center;">${evo.fecha_evolucion ? new Date(evo.fecha_evolucion).toLocaleDateString('es-ES') : ''}</td>
        </tr>
      `).join('');
    }
    let bloqueEvolucion = `
      <div class="section-title">6. Historial de Evolución Clínica</div>
      ${filasEvolucion === '' ? '<div class="text-block" style="color: #666; font-style: italic;">No se registran notas.</div>' : `
        <table class="clinical-table">
          <thead><tr><th>Descripción</th><th style="width:120px;text-align:center">Fecha</th></tr></thead>
          <tbody>${filasEvolucion}</tbody>
        </table>
      `}
    `;

    // D. Datos Especiales Pediatría Nacer
    let bloquePediatriaNacer = '';
    if (this.doctor && this.doctor.speciality?.name === 'Pediatría') {
      bloquePediatriaNacer = `
        <div class="data-item"><span class="label">Peso al nacer:</span> ${this.patient_selected.peso_al_nacer || ''} g</div>
        <div class="data-item"><span class="label">Talla al nacer:</span> ${this.patient_selected.talla_al_nacer || ''} cm</div>
      `;
    }



    // =========================================================
    // INYECCIÓN GENERAL LIMPIA EN DOCUMENT.WRITE
    // =========================================================


    ventanaImpresion.document.write(`
    <html>
      <head>
        <title>Historia Clínica - Klyntic</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.4; color: #111; padding: 40px; margin: 0; }
          .header { text-align: center; border-bottom: 2px solid #007bff; padding-bottom: 15px; }
          .logo-container { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 5px; }
          .logoav { object-fit: contain; }
          .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-size: 13px; margin-top: 15px; text-align: left; }
          .section-title { background-color: #f2f2f2; font-size: 14px; font-weight: bold; text-transform: uppercase; padding: 5px 8px; margin-top: 20px; margin-bottom: 10px; border-left: 4px solid #007bff; -webkit-print-color-adjust: exact; }
          .data-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; font-size: 13px; margin-bottom: 10px; }
          .data-item { margin-bottom: 5px; }
          .label { font-weight: bold; color: #444; }
          .text-block { font-size: 13px; margin: 8px 0; text-align: justify; white-space: pre-wrap; }
          .clinical-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; page-break-inside: avoid; }
          .clinical-table th { background-color: #e6e6e6; border: 1px solid #aaa; padding: 6px; text-align: left; font-weight: bold; }
          .clinical-table td { border: 1px solid #ccc; padding: 6px; }
          .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #777; border-top: 1px solid #ddd; padding-top: 10px; }
          @media print { @page { size: A4; margin: 1.5cm; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-container">
            <img class="logoav" src="${logoBase64}" width="45" height="45" alt="Klyntic Logo">
            <h2>RESUMEN DE HISTORIA CLÍNICA</h2>
          </div>
          <p style="margin: 0; color: #555; font-weight: bold;">Klyntic App</p>
          
          <div class="meta-grid">
            <div><span class="label">Paciente:</span> ${this.patient_selected.full_name || ''}</div>
            <div><span class="label">C.i:</span> ${this.patient_selected.n_doc || ''}</div>
            <div><span class="label">Fecha de Reporte:</span> 02/07/2026</div>
            <div><span class="label">ID Registro:</span> # ${this.patient_selected.id || ''}</div>
          </div>
        </div>

        <div class="section-title">1. Información Demográfica y Antecedentes</div>
        <div class="data-grid">
          <div class="data-item"><span class="label">Sexo:</span> ${this.patient_selected.gender || ''}</div>
          <div class="data-item"><span class="label">Fecha Nacimiento:</span> ${this.patient_selected.birth_date || ''}</div>
          <div class="data-item"><span class="label">Educación:</span> ${this.patient_selected.education || ''}</div>
          <div class="data-item"><span class="label">Teléfono:</span> ${this.patient_selected.phone || ''}</div>
          <div class="data-item"><span class="label">Email:</span> ${this.patient_selected.email || ''}</div>
          <div class="data-item"><span class="label">Dirección:</span> ${this.patient_selected.address || ''}</div>
        </div>
        
        <div class="text-block"><strong>Antecedentes Familiares:</strong> ${this.patient_selected.antecedent_family || 'Ninguno declarado.'}</div>
        <div class="text-block"><strong>Antecedentes Personales:</strong> ${this.patient_selected.antecedent_personal || 'Ninguno declarado.'}</div>
        <div class="text-block"><strong>Antecedentes Alergias:</strong> ${this.patient_selected.antecedent_alerg || 'Ninguna declarada.'}</div>

        <div class="section-title">2. Anamnesis y Signos Vitales</div>
        <div class="text-block"><strong>Motivo de Consulta:</strong> ${this.patient_selected.current_desease || ''}</div>
        
        <div style="font-size: 13px; font-weight: bold; margin-top: 10px; text-decoration: underline;">Signos Vitales:</div>
        <div class="data-grid" style="margin-top: 5px;">
          <div class="data-item"><span class="label">Presión Arterial:</span> ${this.patient_selected.ta || ''} mm/hg</div>
          <div class="data-item"><span class="label">Temperatura:</span> ${this.patient_selected.temperature || ''} °C</div>
          <div class="data-item"><span class="label">Frecuencia Cardíaca:</span> ${this.patient_selected.fc || ''} lpm</div>
          <div class="data-item"><span class="label">Frecuencia Respiratoria:</span> ${this.patient_selected.fr || ''} rpm</div>
          <div class="data-item"><span class="label">Peso Actual:</span> ${this.patient_selected.peso || ''} Kg</div>
          <div class="data-item"><span class="label">Talla Actual:</span> ${this.patient_selected.talla || ''} cm</div>
          ${bloquePediatriaNacer}
        </div>

        <div class="section-title">3. Estado Clínico Actual</div>
        <div class="text-block"><strong>Enfermedad Actual:</strong> ${this.patient_selected.enfermedad_actual || ''}</div>
        <div class="text-block"><strong>Historia de la Enfermedad:</strong> ${this.patient_selected.historia_enfermedad || ''}</div>
        <div class="text-block"><strong>Examen Físico Segmentario:</strong> ${this.patient_selected.examen_fisico || ''}</div>

        <!-- INYECCIÓN SEGURA DE LOS STRING DINÁMICOS -->
        ${bloqueVacunas}
        ${bloqueLaboratorio}
        ${bloqueEvolucion}

        <div class="footer">
          <p>Historia Clínica generada digitalmente a través de Klyntic.</p>
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
