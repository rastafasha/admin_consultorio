import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, ActivatedRoute } from '@angular/router';
import { routes } from 'src/app/shared/routes/routes';
import Swal from 'sweetalert2';
import { LaboratoryService } from '../../laboratory/service/laboratory.service';
import { PresupuestoService } from '../service/presupuesto.service';
import { Doctor, Patient, Presupuesto, PresupuestoItems, Speciality } from '../presupuesto-model';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { DoctorService } from '../../doctors/service/doctor.service';
import { SpecialitieService } from '../../specialitie/service/specialitie.service';
import { RolesService } from '../../roles/service/roles.service';
import { AppointmentService } from '../../appointment/service/appointment.service';
import { FormBuilder, FormGroup } from '@angular/forms';
declare let $:any;  

@Component({
  selector: 'app-presupuesto-editar',
  templateUrl: './presupuesto-editar.component.html',
  styleUrls: ['./presupuesto-editar.component.scss']
})
export class PresupuestoEditarComponent {

  public routes = routes;
  public presupuestoForm: FormGroup;
    titlePage :string;
    valid_form_success = false;
    public text_validation = '';
    public text_success = '';
  
    pageTitle = 'Presupuesto';
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
  
    public presupuestoitems: any = []; // Ensure medical is initialized as an array
    description:any;
    item:any;
    precio:number;
    cantidad:number;
    item_id:number;
    
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
    presupuestoSeleccionado:any;

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
      public fb: FormBuilder,
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
    // this.ativatedRoute.params.subscribe( ({id}) => this.cargarPresupuesto(id));
      this.ativatedRoute.params.subscribe((resp:any)=>{
        this.presupuesto_id = resp.id;
        // this.cargarPresupuesto();
        if(this.presupuesto_id ){
          this.getPresupuesto();
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
  
    
    getPresupuesto(){
      this.presupuestoService.getPresupuesto(this.presupuesto_id).subscribe((resp:any)=>{
        this.presupuesto_selected = resp.presupuesto;
        console.log(this.presupuesto_selected);
        this.presupuestoitems = resp.presupuestoitems ; 
        console.log(this.presupuestoitems);

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
        
      });
    }

    validarFormulario(){
      this.presupuestoForm = this.fb.group({
        name: [''],
        surname: [''],
        n_doc: [''],
        phone: [''],
        name_medical:[''],
        description:[''],
        diagnostico: [''],
        amount: [''],
        // hour:[''],
        speciality_id:[''],
        patient_id:[''],
        doctor_id:[''],
      })
    }


  
    getSpecialities(){
      this.presupuestoService.listConfig().subscribe((resp:any)=>{
        this.specialities = resp.specialities;
      })
    }

    getDoctor(){
      this.doctorService.showDoctor(this.doctor_id).subscribe((resp:any)=>{
        this.DOCTOR_SELECTED = resp.user;
        this.speciality_id = this.DOCTOR_SELECTED.speciality_id;
        this.specialitiService.showSpeciality(this.speciality_id ).subscribe((resp:any)=>{
          // console.log(resp);
        })
      })
    }

    filterPatient(){
      this.appointmentService.getPatient(this.n_doc+"").subscribe((resp:any)=>{
        // console.log(resp);
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
      if (!this.presupuestoitems) {
          this.presupuestoitems = [];
      }
      if (this.name && this.precio > 0) {
        this.presupuestoitems.push({
          // item_id : 1,
          name: this.name,
          cantidad: this.cantidad+'',
          precio: this.precio+''
        });
        this.name = '';
        this.precio = 0;
        this.cantidad = 0;
        this.amount = 0;
        
      }
    
      for (let i = 0; i < this.presupuestoitems.length; i++) {
        this.amount += parseFloat(this.presupuestoitems[i].precio) * parseFloat(this.presupuestoitems[i].cantidad);
      }
    }

    
    deleteMedical(i:any){
      this.presupuestoitems.splice(i,1);
      this.item = '';
      this.cantidad = 0;
      this.precio = 0;
      this.amount = 0;
      

      if(this.presupuestoitems.length === 0){
        this.amount = 0;
        this.item = '';
        this.cantidad = 0;
        this.precio = 0;
      }
      this.presupuestoService.deletePresupuestoItem(this.presupuesto_id, i+1).subscribe((resp:any)=>{
        console.log(resp);
      })
    }

    
  
    
    // eslint-disable-next-line no-debugger
    save() {
       this.presupuestoitems = {
        id: this.presupuestoitems.length,
        presupuesto_id: this.presupuesto_id,
        name: this.name,
        precio: this.precio,
        cantidad: this.cantidad,
       }

      const data ={
      
        //revisamos si hubo actualizacion de la lista de presupuestoitems
        presupuestoitems: this.presupuestoitems,




        amount: this.amount,
        speciality_id: this.speciality_id,
        description: this.description,
        diagnostico: this.diagnostico,
        
        patient_id: this.patient_id,
        name: this.name,
        email: this.email,
        n_doc: this.n_doc,
        surname: this.surname,
        phone: this.phone,
        
        presupuesto_id: this.presupuesto_id,
        user_id: this.doctor_id,
        doctor_id: this.doctor_id,
      }

      
  
      if(this.presupuesto_id){
        this.presupuestoService.editPresupuesto(data, this.presupuesto_id).subscribe((resp:any)=>{
          console.log(data);
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
                  if(this.user.roles[0] === 'DOCTOR'){
                    this.router.navigate(['/presupuesto/list/doctor']);
                  }else{

                    this.router.navigate(['/presupuesto/list']);
                  }
              }
        })
      } else {
      console.log('Creating new presupuesto with data:', data);
        this.presupuestoService.createPresupuesto(data).subscribe((resp:any)=>{
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
                  if(this.user.roles[0] === 'DOCTOR'){
                    this.router.navigate(['/presupuesto/list/doctor']);
                  }else{

                    this.router.navigate(['/presupuesto/list']);
                  }
              }
        })
      }
    }
}
