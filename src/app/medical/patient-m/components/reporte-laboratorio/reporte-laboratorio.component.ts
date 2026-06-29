import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-reporte-laboratorio',
  standalone:false,
  templateUrl: './reporte-laboratorio.component.html',
  styleUrl: './reporte-laboratorio.component.scss'
})
export class ReporteLaboratorioComponent {
  @Input()patientForm:FormGroup;
   public file_selected:any;
  public doc:any;
  public FILE:any;
  public FILES:any;
  public FilesAdded:any;
  text_success:string;
  text_validation:string;

  processFile(e){}
  save(){}

}
