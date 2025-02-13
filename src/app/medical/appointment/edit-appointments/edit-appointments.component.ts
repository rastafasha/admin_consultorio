import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { routes } from 'src/app/shared/routes/routes';
import { AppointmentService } from '../service/appointment.service';
import { RolesService } from '../../roles/service/roles.service';
import { DoctorService } from '../../doctors/service/doctor.service';
import { SpecialitieService } from '../../specialitie/service/specialitie.service';

@Component({
  selector: 'app-edit-appointments',
  templateUrl: './edit-appointments.component.html',
  styleUrls: ['./edit-appointments.component.scss']
})
export class EditAppointmentsComponent {
  public routes = routes;
  public selectedValue!: string;

  valid_form_success = false;
  public text_validation = '';
  public text_success = '';

  hours:any;
  hour:any;
  specialities:any;
  speciality_id:any;
  date_appointment:any;
  
  name = '';
  surname = '';
  n_doc = 0;
  phone = '';
  name_companion = '';
  surname_companion = '';
  
  amount = 0;
  amount_add = 0;
  method_payment = '';

  DOCTORS:any = [];
  DOCTOR:any = [];
  roles:any = [];
  DOCTOR_SELECTED:any;

  selected_segment_hour:any;

  appointment_id:any;
  appointment_selected:any;
  user:any;
  doctor_id:any;

  constructor(
    public appointmentService:AppointmentService,
    public router: Router,
    public roleService: RolesService,
    public doctorService:DoctorService,
    public specialitiService: SpecialitieService,
    public ativatedRoute: ActivatedRoute
  ){

  }

  ngOnInit(): void {
    const USER = localStorage.getItem("user");
    this.user = JSON.parse(USER ? USER: '');
    this.doctor_id = this.user.id;
    this.user = this.roleService.authService.user;
    this.roles = this.user.roles[0];
    window.scrollTo(0, 0);
    this.getDatos();
    this.ativatedRoute.params.subscribe((resp:any)=>{
      this.appointment_id = resp.id;
      console.log(this.appointment_id);
     })
     this.getAppointment();
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
  }

  getDatos(){
    this.appointmentService.listConfig().subscribe((resp:any)=>{
      this.hours = resp.hours;
      this.specialities = resp.specialities;
    })
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

      this.speciality_id = this.appointment_selected.speciality_id;
      this.date_appointment = new Date(this.appointment_selected.date_appointment).toISOString();
      this.selected_segment_hour = this.appointment_selected.selected_segment_hour;
      this.hour = this.appointment_selected.segment_hour.format_segment.hour;
      this.amount= this.appointment_selected.amount;

      this.filtro();
    })
  }
  
  filtro(){
    const data = {
      date_appointment:this.date_appointment,
      hour:this.hour,
      speciality_id:this.speciality_id
    }
    this.appointmentService.lisFiter(data).subscribe((resp:any)=>{
      // console.log(resp);
      this.DOCTORS = resp.doctors;

      this.DOCTORS.forEach((doctor:any) => {
        if(doctor.doctor.id == this.appointment_selected.doctor_id){
          const INDEX = doctor.segments.findIndex((item:any)=> item.id == this.appointment_selected.doctor_schedule_join_hour_id);
          if(INDEX != -1){
            this.showSegment(doctor);
          }
        }
      });
    })
  }

  isDoctorSelected(DOCTOR:any){
    if(DOCTOR.doctor.id == this.appointment_selected.doctor_id){
      return true;
    }
    return false;
  }

  isSegmentSelected(SEGMENT:any){
    if(SEGMENT.id == this.appointment_selected.doctor_schedule_join_hour_id){
      return true;
    }
    return false;
  }

  countDisponibilidad(DOCTOR:any){
    let SEGMENTS = [];
    SEGMENTS = DOCTOR.segments.filter((item:any)=> !item.is_appointment);
    return SEGMENTS.length;
  }

  showSegment(DOCTOR:any){
    this.DOCTOR_SELECTED = DOCTOR;
  }

  selecSegment(SEGMENT:any){
    this.selected_segment_hour = SEGMENT;
  }

  filterPatient(){
    this.appointmentService.getPatient(this.n_doc+"").subscribe((resp:any)=>{
      // console.log(resp);
      if(resp.menssage === 403){
        this.name= '';
        this.surname= '';
        this.phone= '';
        this.n_doc= 0;
      }else{
        this.name= resp.name;
        this.surname= resp.surname;
        this.phone= resp.phone;
        this.n_doc= resp.n_doc;
      }
    })
  }

  resetPatient(){
    this.name= '';
        this.surname= '';
        this.phone= '';
        this.n_doc= 0;
  }

  onDateChange($event:any){
    this.DOCTORS = [];
    this.selected_segment_hour = null;
    this.DOCTOR_SELECTED = null;
  }

  save(){
    this.text_validation = '';

    if( !this.date_appointment|| !this.speciality_id || !this.amount ){
      this.text_validation = "Los campos son Necesarios(fecha, especialidad,el total del pago)";
      return;
    }

    if(new Date(this.date_appointment).getTime() != new Date(this.appointment_selected.date_appointment).getTime()){
      if(!this.selected_segment_hour ){
        this.text_validation = "Es requerido seleccionar un segmento";
      return;
      }
    }


    // || !this.selected_segment_hour 

    const data ={
      "doctor_id": this.DOCTOR_SELECTED.doctor.id,
        "date_appointment": this.date_appointment,
        "speciality_id": this.speciality_id,
        "doctor_schedule_join_hour_id": this.selected_segment_hour ? this.selected_segment_hour.id : this.appointment_selected.doctor_schedule_join_hour_id,
        amount:this.amount,
    }

    this.appointmentService.editAppointment(data, this.appointment_id).subscribe((resp:any)=>{
      // console.log(resp);
      if(resp.message == 403){
        this.text_validation = resp.message_text;
      }else{
        this.text_success = "La Cita medica se ha actualizado";
        this.ngOnInit();

      }
    })
  }
}
