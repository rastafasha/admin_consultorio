import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { PatientMService } from '../../../../services/patient-m.service';
import { RLaboratoryService } from '../../../../services/rlaboratory.service';
import { DomSanitizer } from '@angular/platform-browser';
import { RLaboratory } from '../../../../models/RLaboratory.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reporte-laboratorio',
  standalone: false,
  templateUrl: './reporte-laboratorio.component.html',
  styleUrl: './reporte-laboratorio.component.scss'
})
export class ReporteLaboratorioComponent implements OnInit, OnChanges {
  @Input() patient_selected: any;
  cargando = false;
  public file_selected: any;
  public doc: any;
  public files_to_upload: File[] = [];  // Los archivos binarios reales del input
  public FilesAdded: any[] = [];        // La lista visual que se muestra en tu primer cuadro
  public rlaboratories_list: any[] = []; // El historial persistido de la base de datos

  public rlaboratory: RLaboratory;
  public comentario: string;
  text_success: string;
  text_validation: string;
  public imagenSubir: File;
  public imgTemp: any = null;

  constructor(
    public patientService: PatientMService,
    public rlaboratoryService: RLaboratoryService,
    private _sanitizer: DomSanitizer,
  ) {

  }

  ngOnInit(): void { }

  ngOnChanges(changes: SimpleChanges): void {
    // Detectamos cuando la propiedad cambia de undefined a tener la data del API
    if (changes['patient_selected'] && changes['patient_selected'].currentValue) {
      const dataPaciente = changes['patient_selected'].currentValue;
      // console.log('DEBUG Hijo: ¡Data recibida con éxito!', dataPaciente);

      // Levanta aquí cualquier lógica que necesite procesar los reportes de laboratorio:
      this.getResportes();
    }
  }
  getResportes() {
    this.cargando = true;
    this.rlaboratoryService.getRLaboratoryByPatient(this.patient_selected.id).subscribe((resp: any) => {
      this.rlaboratories_list = resp.laboratories.data;
      this.cargando = false;
    });
  }

  processFile($event: any) {
    if (!$event.target.files) return;
    this.files_to_upload = Array.from($event.target.files);
    console.log('Archivos leídos del input:', this.files_to_upload);
  }

  
  deleteDocument(index: number) {
    this.FilesAdded.splice(index, 1);
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


  agregarArchivo() {
  if (this.files_to_upload.length === 0) {
    if (this.comentario && this.comentario.trim() !== '') {
      this.FilesAdded.push({
        id: 'temp-' + Math.random().toString(36).substr(2, 9),
        name_file: 'Nota de texto (Sin archivo)',
        size: '0',
        raw_file: null, // Sin archivo
        type: 'text',
        preview_url: null,
        comentario_individual: this.comentario
      });
      this.comentario = '';
      this.text_validation = '';
    } else {
      this.text_validation = 'Escribe un comentario o selecciona un archivo primero.';
    }
    return;
  }

  this.files_to_upload.forEach((file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';

    const mockFileObject: any = {
      id: 'temp-' + Math.random().toString(36).substr(2, 9),
      name_file: file.name,
      size: (file.size / 1024).toFixed(1),
      raw_file: file, // ✨ SOLUCIÓN: Guardamos el binario puro en una propiedad exclusiva
      type: extension,
      preview_url: null,
      comentario_individual: this.comentario || ''
    };

    // Generamos el Base64 para el modal local de inmediato
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      mockFileObject.preview_url = this._sanitizer.bypassSecurityTrustResourceUrl(reader.result as string);
    };

    this.FilesAdded.push(mockFileObject);
  });

  this.files_to_upload = [];
  this.comentario = ''; 
  this.text_validation = '';
}

deleteFile(rlaboratori: any) {

    Swal.fire({
      title: 'Estas Seguro?',
      text: 'No podras recuperarlo!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, Borrar!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.cargando = true;
        this.rlaboratoryService.deleteRLaboratory(rlaboratori.id).subscribe((resp: any) => {
          this.getResportes();
        });
        Swal.fire('Borrado!', 'El Archivo fue borrado.', 'success');
      }
    });


  }

save() {
  this.text_validation = '';
  this.text_success = '';

  if (this.FilesAdded.length === 0 && (!this.comentario || this.comentario.trim() === '')) {
    this.text_validation = 'No hay información para guardar.';
    return;
  }

  let formData = new FormData();
  formData.append('patient_id', this.patient_selected.id);
  
  if (this.comentario) {
    formData.append('comentario_general', this.comentario);
  }

  let metaData: any[] = [];
  let fileIndex = 0;

  this.FilesAdded.forEach((item: any) => {
    if (item.raw_file) { // ✨ Leemos la propiedad blindada
      // Empaquetamos el binario real en el FormData
      formData.append('files[' + fileIndex + ']', item.raw_file);
      
      metaData.push({
        has_file: true,
        file_index: fileIndex,
        comentario: item.comentario_individual
      });
      fileIndex++;
    } else {
      metaData.push({
        has_file: false,
        file_index: null,
        comentario: item.comentario_individual
      });
    }
  });

  formData.append('file_metadata', JSON.stringify(metaData));

  this.rlaboratoryService.storeRLaboratory(formData).subscribe((resp: any) => {
    this.text_success = 'Información de laboratorio guardada con éxito.';
    this.FilesAdded = []; 
    this.comentario = ''; 
    this.getResportes(); // Recargamos la tabla inferior
  });
}





}
