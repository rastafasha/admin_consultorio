import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientMService } from '../../patient-m/service/patient-m.service';
import { Patient } from 'src/app/models/patient.model';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { Validators } from 'ngx-editor';
import { routes } from 'src/app/shared/routes/routes';
import { AppointmentService } from '../service/appointment.service';
import { DoctorService } from '../../doctors/service/doctor.service';
import { RolesService } from '../../roles/service/roles.service';
import { SpecialitieService } from '../../specialitie/service/specialitie.service';
import { SettignService } from 'src/app/core/settings/settigs.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-atender',
  templateUrl: './atender.component.html',
  styleUrls: ['./atender.component.scss']
})
export class AtenderComponent implements OnInit{

  patient_id:number;
  doctor_id:number;
  patient:Patient;
  pageTitle:string;
  public routes = routes;
  
    valid_form_success = false;
    public text_validation = '';
    public text_success = '';

  public atentionForm: FormGroup;
  public patientSeleccionado: Patient;

  public medical:any = [];
  description:any;
  name_medical:any;
  uso:any;

  user:any;

  hours:any;
  hour:any;
  specialities:any;
  speciality_id:any;
  date_appointment:any;
  roles:any = [];
  DOCTOR_SELECTED:any;

  tiposdepagos:any;
  amount = 0;
  amount_add = 0;
  method_payment = '';
  selected_segment_hour:any;
  schedule_selecteds:any;
  errors:any = null;

  constructor(
    public patientService: PatientMService,
    public ativatedRoute: ActivatedRoute,
    public forms: ActivatedRoute,
    private fb: FormBuilder,
    public router: Router,
    public appointmentService: AppointmentService,
    public doctorService:DoctorService,
        public specialitiService: SpecialitieService,
        public roleService: RolesService,
        public settigService: SettignService,

  ){

  }

  ngOnInit(): void {
    // this.ativatedRoute.params.subscribe((resp:any)=>{
    //   this.patient_id = resp.id;
    //   console.log(this.patient_id);
    //   this.getPatient();
    //  })

    this.doctorService.closeMenuSidebar();
    window.scrollTo(0, 0);
    this.ativatedRoute.params.subscribe( ({id}) => this.cargarPatient(id));

    const USER = localStorage.getItem("user");
    this.user = JSON.parse(USER ? USER: '');
    this.user = this.roleService.authService.user;
    this.roles = this.user.roles[0];

    this.doctor_id = this.user.id;
    // console.log(this.doctor_id);

    this.appointmentService.listConfig().subscribe((resp:any)=>{
      this.hours = resp.hours;
      this.specialities = resp.specialities;
    })

    // this.getTiposdePago();
    if(this.roles === 'DOCTOR'){
      this.doctorService.showDoctor(this.doctor_id).subscribe((resp:any)=>{
        this.DOCTOR_SELECTED = resp.user;
        console.log(this.DOCTOR_SELECTED);

        this.speciality_id = this.DOCTOR_SELECTED.speciality_id;
        this.specialitiService.showSpeciality(this.speciality_id ).subscribe((resp:any)=>{
          console.log(resp);
        })

      })
    }
    this.validarFormulario();
    this.getTiposdePagoByDoctor();
    this.getDoctor()
  }



  cargarPatient(id){

    this.patient_id = id;

    if (this.patient_id) {
      this.pageTitle = 'Edit ';
      this.patientService.getPatient(this.patient_id).subscribe(
        (resp:any) => {
          this.atentionForm.patchValue({
            id: resp.patient.id,
            n_doc: resp.patient.n_doc,
            name: resp.patient.name,
            surname: resp.patient.surname,
            phone: resp.patient.phone,
            name_companion: resp.patient.name_companion,
            surname_companion: resp.patient.surname_companion,
            antecedent_alerg: resp.patient.antecedent_alerg,
            // user_id: this.patientSeleccionado.id,

          });
          this.patientSeleccionado = resp.patient;
          console.log(this.patientSeleccionado);
        }
      );
    } else {
      this.pageTitle = 'Create Blog';
    }

  }

  getTiposdePagoByDoctor(){
    this.settigService.getActivoPagoByDoctor(this.doctor_id).subscribe((resp:any)=>{
      console.log(resp);
      this.tiposdepagos = resp.tiposdepagos;
      // console.log(this.tiposdepagos);
    })
}

getDoctor(){
  this.doctorService.showDoctor(this.doctor_id).subscribe((resp:any)=>{
    console.log(resp);
    this.DOCTOR_SELECTED = resp.user;
    this.schedule_selecteds= resp.user.schedule_selecteds;
  })
}





countDisponibilidad(DOCTOR:any){
  let SEGMENTS = [];
  this.DOCTOR_SELECTED = DOCTOR;
  SEGMENTS = DOCTOR.segments.filter((item:any)=> !item.is_appointment);
  return SEGMENTS.length;
}

selecSegment(SEGMENT:any){
  this.selected_segment_hour = SEGMENT;
}


    validarFormulario(){
      this.atentionForm = this.fb.group({
        name: [''],
        surname: [''],
        n_doc: [''],
        phone: [''],
        name_companion: [''],
        surname_companion:[''],
        antecedent_alerg:[''],
        name_medical:[''],
        description:[''],
        uso: [''],
        date_appointment:[''],
        // hour:[''],
        speciality_id:[''],
      })
    }

    addMedicamento(){
      this.medical.push({
        name_medical: this.name_medical,
        uso: this.uso
      })
      this.name_medical = '';
      this.uso = '';
    }

    deleteMedical(i:any){
      this.medical.splice(i,1);
    }
    

    // eslint-disable-next-line no-debugger
    onSave(){
    //   this.text_validation = '';
    // if(!this.description || this.medical.length == 0){
    //   this.text_validation = 'Es requerido ingresar el diagnostico y una receta medica';
    //   return;
    // }
   
    const data ={
      ...this.atentionForm.value,
      medical: this.medical,
      method_payment: this.method_payment,
      date_appointment: this.date_appointment,
      amount:this.amount,
      amount_add :this.amount_add,
      "doctor_schedule_join_hour_id":this.hour,
      // doctor_schedule_join_hour_id:this.schedule_selecteds.item.id,
      // hour:this.hour,
      segment_hour:this.hour,
      speciality_id:this.speciality_id,
      
      appointment_id:0,
      patient_id: this.patientSeleccionado.id,
      user_id: this.doctor_id,
      doctor_id: this.doctor_id,
      
    }



    
    this.appointmentService.registerAttentionLocal(data).subscribe((resp:any)=>{
      // console.log(data );
      Swal.fire('Registrado!', `Se guardó la informacion de la Atención médica`, 'success');
      // this.text_success = 'Se guardó la informacion de la cita médica'
      this.router.navigate(['/appointments/list/doctor', this.doctor_id]);
      
    },(error) => {
      Swal.fire('Error', error.error.msg, 'error');
      // this.errors = error.error;
    });
    }
}
