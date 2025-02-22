import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { routes } from 'src/app/shared/routes/routes';
import Swal from 'sweetalert2';
import { LaboratoryService } from '../../laboratory/service/laboratory.service';
import { PresupuestoService } from '../service/presupuesto.service';
import { Doctor, Patient, Presupuesto, Speciality } from '../presupuesto-model';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { DoctorService } from '../../doctors/service/doctor.service';
import { SpecialitieService } from '../../specialitie/service/specialitie.service';
import { RolesService } from '../../roles/service/roles.service';
import { AppointmentService } from '../../appointment/service/appointment.service';
declare let $:any;  

@Component({
  selector: 'app-presupuesto-editar',
  templateUrl: './presupuesto-editar.component.html',
  styleUrls: ['./presupuesto-editar.component.scss']
})
export class PresupuestoEditarComponent {

  public routes = routes;
    titlePage :string;
    valid_form_success = false;
    public text_validation = '';
    public text_success = '';
  
    isediting=false;
    isdisabled=false;
    isdoctor=false;
    name = '';
    surname = '';
    n_doc :number;
    phone = '';
    email = '';
    amount = 0;
  
    laboratory = false;
    laboratory_number = 1;
  
    public medical:any = [];
    description:any;
    name_medical:any;
    precio= 0;
    
    presupuesto_id:number;
    speciality_id:number;
    presupuesto_selected:any;
    appointment_atention_selected:string;
    diagnostico:string;
  
    antecedent_alerg:any;
  
    public file_selected:any;
    public doc:any;
    public user:any;

    patient:Patient [];
    patient_id:Patient;
    doctor:Doctor [];
    doctor_id:Doctor;
    speciality:Speciality [];
    specialities:Speciality [];
    DOCTOR_SELECTED:any;

    id = 0;
  
    constructor(
      public presupuestoService:PresupuestoService,
      public laboratoryService:LaboratoryService,
      public authService:AuthService,
      public router: Router,
      public ativatedRoute: ActivatedRoute,
      public doctorService:DoctorService,
      public specialitiService: SpecialitieService,
      public roleService: RolesService,
      public appointmentService: AppointmentService,
    ){
      this.user = this.authService.user;
    }
  
    ngOnInit(): void {
      this.isediting = false;
      this.isdisabled = false;
      this.isdoctor = false;
      window.scrollTo(0, 0);
      const USER = localStorage.getItem("user");
    this.user = JSON.parse(USER ? USER: '');
    this.user = this.roleService.authService.user;
    this.doctor_id = this.user.id;

    if(this.user.roles[0] === 'DOCTOR'){
      this.isdoctor = true;
      this.isdisabled = false;
    }

      this.ativatedRoute.params.subscribe((resp:any)=>{
        this.presupuesto_id = resp.id;
        if(this.presupuesto_id ){
          this.getAppointment();
          this.titlePage = 'Editando Presupuesto';
          this.isediting = true;
          if(this.isediting === true){
              this.isdisabled = true;
          }
        }else{
          this.isediting = false;
          this.titlePage = 'Crear Presupuesto';
        }
      })
      this.getDoctor();
      this.getSpecialities();
      
      
    }
  
    getAppointment(){
      this.presupuestoService.getPresupuesto(this.presupuesto_id).subscribe((resp:Presupuesto)=>{
        this.presupuesto_selected = resp;
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
  
      });
      
  
    }
  
    
    getSpecialities(){
      this.presupuestoService.listConfig().subscribe((resp:any)=>{
        this.specialities = resp.specialities;
      })
    }

    getDoctor(){
  

      this.doctorService.showDoctor(this.doctor_id).subscribe((resp:any)=>{
        this.DOCTOR_SELECTED = resp.user;
        // console.log(this.DOCTOR_SELECTED);
        this.speciality_id = this.DOCTOR_SELECTED.speciality_id;
        this.specialitiService.showSpeciality(this.speciality_id ).subscribe((resp:any)=>{
          console.log(resp);
        })
    
      })
    }

    filterPatient(){
      this.appointmentService.getPatient(this.n_doc+"").subscribe((resp:any)=>{
        console.log(resp);
        this.patient = resp;
        if(resp.menssage === 403){
          this.name= '';
          this.surname= '';
          this.phone= '';
          this.email= '';
          this.n_doc= 0;
        }else{
          this.name= resp.name;
          this.surname= resp.surname;
          this.email= resp.email;
          this.phone= resp.phone+'';
          this.n_doc= resp.n_doc;
        }
      })
    }

    resetPatient(){
      this.name= '';
          this.surname= '';
          this.email= '';
          this.phone= '';
          this.n_doc= 0;
    }

    addMedicamento() {
      if (this.name_medical && this.precio > 0) {
        this.medical.push({
          name_medical: this.name_medical,
          precio: this.precio+''
        });
        this.name_medical = '';
        this.precio = 0;
        
      }
      //
      // vamos mostrando, estrallendo el valor de precio y se suma en el input amount
      this.amount = 0;
      for (let i = 0; i < this.medical.length; i++) {
        this.amount += parseFloat(this.medical[i].precio);
      }


     


      }

    deleteMedical(i:any){
      this.medical.splice(i,1);
      this.name_medical = '';
      this.precio = 0;
      // si se elimina un item actualizamos el valor de amount
      this.amount = 0;
      for (let i = 0; i < this.medical.length; i++) {
        this.amount += parseFloat(this.medical[i].precio);
      }
      //si se borra todo el array de medical, el amount se pone en 0
      if(this.medical.length === 0){
        this.amount = 0;
      }

    }
  
    
    // eslint-disable-next-line no-debugger
    save(){debugger
      this.text_validation = '';
      // if(!this.name_laboratory){
      //   this.text_validation = 'Es requerido ingresar un nombre';
      //   return;
      // }

  
      const formData = new FormData();
      if(this.presupuesto_id){

        formData.append('presupuesto_id', this.presupuesto_selected.id+'');
      }
  
      
      if(this.phone){
        formData.append('phone', this.phone);
      }
      if(this.email){
        formData.append('email', this.email);
      }
      if(this.surname){
        formData.append('surname', this.surname);
      }
      if(this.name){
        formData.append('name', this.name);
      }
      if(this.n_doc){
        formData.append('n_doc', this.n_doc+'');
      }
      if(this.patient_id){
        formData.append('patient_id', this.patient_id+'');
      }
      if(this.doctor_id){
      formData.append('doctor_id', this.user.id+'');
      }
      
      if(this.speciality_id){
        formData.append('speciality_id', this.speciality_id+'');
      }
      if(this.description){
        formData.append('description', this.description);

      }
      if(this.diagnostico){
        formData.append('diagnostico', this.diagnostico);

      }
      if (this.medical.length > 0) {
        formData.append('medical', JSON.stringify(this.medical));

      }
      if(this.amount !== null && this.amount !== undefined){
        formData.append('amount', this.amount+'');
      }
      
      
  
      if(this.presupuesto_id){
        //editamos

        this.presupuestoService.editPresupuesto(formData, this.presupuesto_id).subscribe((resp:any)=>{
          if(resp.message == 403){
            this.text_validation = resp.message_text;
            Swal.fire({
              position: "top-end",
                    icon: "warning",
                    title: this.text_validation,
                    showConfirmButton: false,
                    timer: 1500
                  });
                }else{
                    this.text_success = 'Se guardó la informacion del Laboratorio con la cita'
                  Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: this.text_success,
                    showConfirmButton: false,
                    timer: 1500
                  });
                  this.router.navigate(['/presupuesto/list']);
              }
        })
      }else {
        //creamos
        this.presupuestoService.createPresupuesto(formData).subscribe((resp:any)=>{
          if(resp.message == 403){
            this.text_validation = resp.message_text;
            Swal.fire({
              position: "top-end",
                    icon: "warning",
                    title: this.text_validation,
                    showConfirmButton: false,
                    timer: 1500
                  });
                }else{
                    this.text_success = 'Se guardó la informacion del Laboratorio con la cita'
                  Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: this.text_success,
                    showConfirmButton: false,
                    timer: 1500
                  });
                  this.router.navigate(['/presupuesto/list']);
              }
        })
      }
  
    }

}
