import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { routes } from 'src/app/shared/routes/routes';
import { AppointmentService } from '../service/appointment.service';

@Component({
  selector: 'app-atencion-medica',
  templateUrl: './atencion-medica.component.html',
  styleUrls: ['./atencion-medica.component.scss']
})
export class AtencionMedicaComponent {
  public routes = routes;

  valid_form_success: boolean = false;
  public text_validation:string = '';
  public text_success:string = '';

  
  name:string = '';
  surname:string = '';
  n_doc:number = 0;
  phone:string = '';
  name_companion:string = '';
  surname_companion:string = '';

  laboratory:boolean = false;
  laboratory_number:number = 1;

  public medical:any = [];
  description:any;
  name_medical:any;
  uso:any;
  
  appointment_id:any;
  appointment_selected:any;
  appointment_atention_selected:any;
  antecedent_alerg:any;


  constructor(
    public appointmentService:AppointmentService,
    public router: Router,
    public ativatedRoute: ActivatedRoute
  ){

  }

  ngOnInit(): void {
    
    window.scrollTo(0, 0);
    this.ativatedRoute.params.subscribe((resp:any)=>{
      this.appointment_id = resp.id;
      console.log(this.appointment_id);
     })
     this.getAppointment();
  }

  getAppointment(){
    this.appointmentService.showAppointment(this.appointment_id).subscribe((resp:any)=>{
      // console.log(resp);
      this.appointment_selected = resp.appointment;

      this.name = this.appointment_selected.patient.name;
      this.surname = this.appointment_selected.patient.surname;
      this.n_doc = this.appointment_selected.patient.n_doc;  
      this.phone = this.appointment_selected.patient.phone; 
      this.name_companion = this.appointment_selected.patient.name_companion;
      this.surname_companion = this.appointment_selected.patient.surname_companion;
      this.antecedent_alerg = this.appointment_selected.patient.antecedent_alerg;

    });
    // cita medica

    this.appointmentService.showCitamedica(this.appointment_id).subscribe((resp:any)=>{
      console.log(resp);

      this.appointment_atention_selected = resp.appointment_attention;
      this.medical =this.appointment_atention_selected.receta_medica;
      this.description =this.appointment_atention_selected.description;
      this.laboratory_number =this.appointment_atention_selected.laboratory;

      if(this.laboratory_number === 2){
        this.laboratory = true
      }else{
        this.laboratory = false
      }


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
  

  save(){
    this.text_validation = '';
    if(!this.description || this.medical.length == 0){
      this.text_validation = 'Es requerido ingresar el diagnostico y una receta medica';
      return;
    }

    if(this.laboratory == true ){
      this.laboratory_number = 2
    }else{
      this.laboratory_number = 1
    }

    let data ={
      appointment_id: this.appointment_id,
      description: this.description,
      medical: this.medical,
      laboratory: this.laboratory_number,
      patient_id: this.appointment_selected.patient_id,
    }

    this.appointmentService.registerAttention(data).subscribe((resp:any)=>{
      // console.log(resp);
      this.text_success = 'Se guardó la informacion de la cita médica'
    })

  }
} 
