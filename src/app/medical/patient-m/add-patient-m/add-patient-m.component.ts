import { Component } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
import { StaffService } from '../../staff/service/staff.service';
import { Router } from '@angular/router';
import { PatientMService } from '../service/patient-m.service';
import { DoctorService } from '../../doctors/service/doctor.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-patient-m',
  templateUrl: './add-patient-m.component.html',
  styleUrls: ['./add-patient-m.component.scss']
})
export class AddPatientMComponent {
  public routes = routes;
  public selectedValue!: string;

  public name: string = '';
  public surname: string = '';
  public phone: string = '';
  public email: string = '';
  public birth_date: string = '';
  public gender: number = 1;
  public education: string = '';
  public address: string = '';
  public n_doc: any;

 
  public FILE_AVATAR:any;
  public IMAGE_PREVISUALIZA:any = 'assets/img/user-06.jpg';

  valid_form:boolean = false;
  valid_form_success:boolean = false;
  text_validation:any = null;
  public text_success:string = '';

  public antecedent_personal:string = '';
  public antecedent_family:string = '';
  public antecedent_alerg:string = '';

  public name_companion:string = '';
  public surname_companion:string = '';
  public mobile_companion:string = '';
  public relationship_companion:string = '';

  public name_responsable:string = '';
  public surname_responsable:string = '';
  public mobile_responsable:string = '';
  public relationship_responsable:string = '';

  public ta:number = 0;
  public temperature:number = 0;
  public fc:number = 0;
  public fr:number = 0;
  public peso:number = 0;
  public current_desease:string = '';
  public doctor_id:any;
  public user:any;

  
  constructor(
    public patientService:PatientMService,
    public doctorService:DoctorService,
    public router: Router,
  ){

  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.doctorService.closeMenuSidebar();
    let USER = localStorage.getItem("user");
    this.user = JSON.parse(USER ? USER: '');
    this.doctor_id = this.user.id;
    console.log(this.doctor_id);
  }

  

  loadFile($event:any){
    if($event.target.files[0].type.indexOf("image")){
      this.text_validation = 'Solamente pueden ser archivos de tipo imagen';
      return;
    }
    this.text_validation = '';
    this.FILE_AVATAR = $event.target.files[0];
    let reader = new FileReader();
    reader.readAsDataURL(this.FILE_AVATAR);
    reader.onloadend = ()=> this.IMAGE_PREVISUALIZA = reader.result;
  }
 

  save(){
    this.text_validation = '';
    if(!this.name ||!this.surname || !this.n_doc ){
      this.text_validation = 'Los campos con * son obligatorios';
      return;
    }
    // if(!this.ta || !this.fc || !this.fr || !this.peso || !this.temperature){
    //   this.text_validation = 'Los signos vitales son obligatorios';
    //   return;
    // }


    // this.valid_form = false;
    let formData = new FormData();

    formData.append('name', this.name);
    formData.append('surname', this.surname);
    formData.append('phone', this.phone);
    formData.append('gender', this.gender+'');
    formData.append('address', this.address);
    formData.append('n_doc', this.n_doc);
    // formData.append('ta', this.ta+'');
    // formData.append('fc', this.fc+'');
    // formData.append('fr', this.fr+'');
    // formData.append('peso', this.peso+'');
    // formData.append('temperature', this.temperature+'');
    formData.append('doctor_id', this.doctor_id);
    
    if(this.ta+'' ){
      formData.append('ta', this.ta+'');
    }
    if(this.fc+'' ){
      formData.append('fc', this.fc+'');
    }
    if(this.fr+'' ){
      formData.append('fr', this.fr+'');
    }
    if(this.peso+'' ){
      formData.append('peso', this.peso+'');
    }
    if(this.temperature+'' ){
      formData.append('temperature', this.temperature+'');
    }
    if(this.selectedValue ){
      formData.append('role_id', this.selectedValue);
    }
    
    if(this.antecedent_personal){

      formData.append('antecedent_personal', this.antecedent_personal);
    }
    if(this.antecedent_family){

      formData.append('antecedent_family', this.antecedent_family);
    }
    if(this.antecedent_alerg){

      formData.append('antecedent_alerg', this.antecedent_alerg);
    }
    if(this.name_companion){

      formData.append('name_companion', this.name_companion);
    }
    if(this.surname_companion){

      formData.append('surname_companion', this.surname_companion);
    }
    if(this.mobile_companion){

      formData.append('mobile_companion', this.mobile_companion);
    }
    if(this.relationship_companion){

      formData.append('relationship_companion', this.relationship_companion);
    }
    if(this.name_responsable){

      formData.append('name_responsable', this.name_responsable);
    }
    if(this.surname_responsable){

      formData.append('surname_responsable', this.surname_responsable);
    }
    if(this.mobile_responsable){

      formData.append('mobile_responsable', this.mobile_responsable);
    }
    if(this.relationship_responsable){

      formData.append('relationship_responsable', this.relationship_responsable);
    }
    
    if(this.current_desease){
      formData.append('current_desease', this.current_desease);
    
    }
    if(this.education){
      formData.append('education', this.education);
    }
    if(this.birth_date){
      formData.append('birth_date', this.birth_date);
    }
    if(this.email){
      formData.append('email', this.email);
    }
    if(this.FILE_AVATAR){
      formData.append('imagen', this.FILE_AVATAR);
    }

    this.valid_form_success = false;
    this.text_validation = '';

    this.patientService.createPatient(formData).subscribe((resp:any)=>{
      // console.log(resp);
      if(resp.message == 403){
        this.text_validation = resp.message_text;
      }else{
        // this.valid_form_success = true;
        // this.text_success = "El Paciente se ha Creado";
        Swal.fire('Exito!', `El Paciente se ha Creado`, 'success');
        // this.name = '';
        // this.surname = '';
        // this.phone = '';
        // this.email = '';
        // this.birth_date = '';
        // this.education = '';
        // this.address = '';
        // this.n_doc = '';
        // this.antecedent_personal = '';
        // this.antecedent_family = '';
        // this.antecedent_alerg = '';
        // this.name_companion = '';
        // this.surname_companion = '';
        // this.mobile_companion = '';
        // this.relationship_companion = '';
        // this.name_responsable = '';
        // this.surname_responsable = '';
        // this.mobile_responsable = '';
        // this.relationship_responsable = '';
        // this.ta = 0;
        // this.temperature = 0;
        // this.fc = 0;
        // this.fr = 0;
        // this.peso = 0;
        // this.current_desease = '';
        // this.FILE_AVATAR = '';
        
        // this.router.navigate(['/patient/list/doctor/', this.doctor_id]);
      }
    })


  }
}
