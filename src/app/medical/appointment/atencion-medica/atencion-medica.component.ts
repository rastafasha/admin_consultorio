import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { routes } from 'src/app/shared/routes/routes';
import { AppointmentService } from '../service/appointment.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-atencion-medica',
  templateUrl: './atencion-medica.component.html',
  styleUrls: ['./atencion-medica.component.scss']
})
export class AtencionMedicaComponent {
  public routes = routes;
  isLoading = false;

  valid_form_success = false;
  public text_validation = '';
  public text_success = '';

  

  
  name = '';
  surname = '';
  n_doc = 0;
  phone = '';
  name_companion = '';
  surname_companion = '';

  laboratory = false;
  laboratory_number = 1;

  public medical:any = [];
  description:any;
  name_medical:any;
  uso:any;
  
  appointment_id:any;
  appointment_selected:any;
  appointment_atention_selected:any;
  antecedent_alerg:any;
  user:any;
  roles:any;


  constructor(
    public appointmentService:AppointmentService,
    public router: Router,
    public ativatedRoute: ActivatedRoute
  ){

  }

  ngOnInit(): void {
    
    window.scrollTo(0, 0);
    const USER = localStorage.getItem("user");
    this.user = JSON.parse(USER ? USER: '');
    // this.doctor_id = this.user.id;
    this.roles = this.user.roles[0];

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

    const data ={
      appointment_id: this.appointment_id,
      description: this.description,
      medical: this.medical,
      laboratory: this.laboratory_number,
      patient_id: this.appointment_selected.patient_id,
    }

    this.appointmentService.registerAttention(data).subscribe((resp:any)=>{
      // console.log(resp);
      // Swal.fire('Actualizado', this.text_success, 'success');
      if(resp.message == 403){
                    // Swal.fire('Actualizado', this.text_validation, 'success');
                    this.text_validation = resp.message_text;
                    Swal.fire({
                      position: "top-end",
                      icon: "warning",
                      title: this.text_validation,
                      showConfirmButton: false,
                      timer: 1500
                    });
                  }else{
                    // Swal.fire('Actualizado', this.text_success, 'success' );
                    // this.text_success = 'La Cita medica se ha creado, favor espere la verificacion de  el pago';
                    this.text_success = 'Se guardó la informacion de la cita médica'
                    Swal.fire({
                      position: "top-end",
                      icon: "success",
                      title: this.text_success,
                      showConfirmButton: false,
                      timer: 1500
                    });
                    if(this.user.roles === 'SUPERADMIN'){
                      this.router.navigate(['/appointments/list']);
                    }
                    if(this.user.roles === 'DOCTOR'){
                      this.router.navigate(['/appointments/list/doctor/', this.user.id]);
                    }
                }
    })

  }
} 
