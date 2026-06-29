import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { PatientMService } from '../../../../services/patient-m.service';
import { RLaboratoryService } from '../../../../services/rlaboratory.service';
import { DomSanitizer } from '@angular/platform-browser';
import { RLaboratory } from '../../../../models/RLaboratory.model';

@Component({
  selector: 'app-reporte-laboratorio',
  standalone: false,
  templateUrl: './reporte-laboratorio.component.html',
  styleUrl: './reporte-laboratorio.component.scss'
})
export class ReporteLaboratorioComponent implements OnInit {
 reporteForm: FormGroup;
  public file_selected: any;
  public patient_selected: any;
  public doc: any;
  public FILE: any;
  public FILES: any;
  public rlaboratory: RLaboratory;
  public FilesAdded: any;
  text_success: string;
  text_validation: string;

  constructor(
    public patientService: PatientMService,
    public rlaboratoryService: RLaboratoryService,
    private _sanitizer: DomSanitizer,
  ) {

  }

  ngOnInit(): void {
    this.getResportes();
  }

  processFile($event: any) {
    for (const file of $event.target.files) {
      this.FILES.push(file);
    }
    // console.log(this.FILES);

  }

  deleteFile(FILE: any) {
    this.FilesAdded.splice(FILE, 1);
    this.rlaboratoryService.deleteRLaboratory(FILE.id).subscribe((resp: any) => {
      this.getResportes();
    })
  }

  getResportes() {
    this.rlaboratoryService.getRLaboratoryByPatient(this.patient_selected.id).subscribe((resp: any) => {
      this.FILES = resp;
    })
  }


  deleteDocument(i: any) {
    this.FILES.splice(i, 1);
  }

  selectDoc(FILE: any) {
    this.file_selected = FILE;
  }

  getDocumentIframe(url) {
    var document, results;

    if (url === null) {
      return '';
    }
    results = url.match('[\\?&]v=([^&#]*)');
    document = (results === null) ? url : results[1];

    return this._sanitizer.bypassSecurityTrustResourceUrl(document);
  }


  save() {
    this.text_validation = '';
    if (this.FILES.length === 0) {
      this.text_validation = 'Necesitas subir un recurso'
      return;
    }

    let formData = new FormData();
    formData.append('patient_id', this.patient_selected.id);

    this.FILES.forEach((file: any, index: number) => {
      formData.append("files[" + index + "]", file);
    });

    this.rlaboratoryService.storeRLaboratory(formData).subscribe((resp: any) => {
      // console.log(resp);
      this.text_success = 'Se guardó la informacion de la cita médica'
      this.getResportes();
    })

  }

}
