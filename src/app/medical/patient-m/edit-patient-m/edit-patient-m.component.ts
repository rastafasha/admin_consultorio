import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { routes } from 'src/app/shared/routes/routes';
import { PatientMService } from '../service/patient-m.service';
import { RolesService } from '../../roles/service/roles.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-patient-m',
  templateUrl: './edit-patient-m.component.html',
  styleUrls: ['./edit-patient-m.component.scss']
})
export class EditPatientMComponent {
  public routes = routes;
  public selectedValue!: string;

  public name = '';
  public surname = '';
  public phone = '';
  public email = '';
  public birth_date = '';
  public gender = 1;
  public education = '';
  public address = '';
  public n_doc: any;
  public doctor_id: any;
  public user:any;

  public FILE_AVATAR:any;
  public IMAGE_PREVISUALIZA:any = 'assets/img/user-06.jpg';

  valid_form_success = false;
  public text_validation = '';
  public text_success = '';

  public antecedent_personal = '';
  public antecedent_family = '';
  public antecedent_alerg = '';

  public name_companion = '';
  public surname_companion = '';
  public mobile_companion = '';
  public relationship_companion = '';

  public name_responsable = '';
  public surname_responsable = '';
  public mobile_responsable = '';
  public relationship_responsable = '';

  public ta = 0;
  public temperature = 0;
  public fc = 0;
  public fr = 0;
  public peso = 0;
  public current_desease = '';
  public patient_selected:any;
  public patient_id:any;

  
  constructor(
    public patientService:PatientMService,
    public router: Router,
    public ativatedRoute: ActivatedRoute,
    public roleService: RolesService,

  ){

  }

  ngOnInit(): void {
    const USER = localStorage.getItem("user");
    this.user = JSON.parse(USER ? USER: '');
    this.doctor_id = this.user.id;
    this.user = this.roleService.authService.user;

    window.scrollTo(0, 0);
    this.ativatedRoute.params.subscribe((resp:any)=>{
      this.patient_id = resp.id;
     })
     this.showUser();
     
  }
  
showUser(){
    this.patientService.getPatient(this.patient_id).subscribe((resp:any)=>{
      // console.log(resp);
      this.patient_selected = resp.patient;

        this.name = this.patient_selected.name;
        this.surname = this.patient_selected.surname;
        this.phone = this.patient_selected.phone;
        this.email = this.patient_selected.email;
        this.birth_date = this.patient_selected.birth_date ? new Date(this.patient_selected.birth_date).toISOString(): '';
        this.antecedent_personal=this.patient_selected.antecedent_personal;
        this.antecedent_family=this.patient_selected.antecedent_family;
        this.antecedent_alerg=this.patient_selected.antecedent_alerg;
        this.current_desease=this.patient_selected.current_desease;
        this.education=this.patient_selected.education;
        this.gender = this.patient_selected.gender;
        this.address = this.patient_selected.address;
        this.n_doc = this.patient_selected.n_doc;

        this.name_companion=this.patient_selected.person.name_companion;
        this.surname_companion=this.patient_selected.person.surname_companion;
        this.mobile_companion=this.patient_selected.person.mobile_companion;
        this.relationship_companion=this.patient_selected.person.relationship_companion;
        this.name_responsable=this.patient_selected.person.name_responsable;
        this.surname_responsable=this.patient_selected.person.surname_responsable;
        this.mobile_responsable=this.patient_selected.person.mobile_responsable;
        this.relationship_responsable=this.patient_selected.person.relationship_responsable;

        this.ta = this.patient_selected.ta;
        this.fc = this.patient_selected.fc;
        this.fr = this.patient_selected.fr;
        this.peso = this.patient_selected.peso;
        this.temperature = this.patient_selected.temperature;
        this.IMAGE_PREVISUALIZA = this.patient_selected.avatar;
    })
  }

  loadFile($event:any){
    if($event.target.files[0].type.indexOf("image")){
      this.text_validation = 'Solamente pueden ser archivos de tipo imagen';
      return;
    }
    this.text_validation = '';
    this.FILE_AVATAR = $event.target.files[0];
    const reader = new FileReader();
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
    const formData = new FormData();

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

    this.patientService.editPatient(formData, this.patient_id).subscribe((resp:any)=>{
      // console.log(resp);
      if(resp.message == 403){
        this.text_validation = resp.message_text;
      }else{
        Swal.fire('Exito!', `El Paciente se ha Actualizado`, 'success');
        // this.text_success = "El Paciente se ha actualizado";
      }
    })


  }
}
