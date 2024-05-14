import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { routes } from 'src/app/shared/routes/routes';
import { AppointmentService } from '../service/appointment.service';
import { DoctorService } from '../../doctors/service/doctor.service';
import { SettignService } from 'src/app/core/settings/settigs.service';
import { RolesService } from '../../roles/service/roles.service';

@Component({
  selector: 'app-add-appointments',
  templateUrl: './add-appointments.component.html',
  styleUrls: ['./add-appointments.component.scss']
})
export class AddAppointmentsComponent {
  public routes = routes;
  public selectedValue!: string;

  valid_form_success: boolean = false;
  public text_validation:string = '';
  public text_success:string = '';

  hours:any;
  hour:any;
  specialities:any;
  speciality_id:any;
  date_appointment:any;
  
  id:number = 0;
  name:string = '';
  surname:string = '';
  n_doc:number = 0;
  phone:string = '';
  name_companion:string = '';
  surname_companion:string = '';
  
  amount:number = 0;
  amount_add:number = 0;
  method_payment:string = '';

  patient:any = [];
  DOCTORS:any = [];
  DOCTOR:any = [];
  roles:any = [];
  DOCTOR_SELECTED:any;
  
  selected_segment_hour:any;
  
  tiposdepagos:any;
  user:any;
  doctor_id:any;
  

  constructor(
    public appointmentService:AppointmentService,
    public doctorService:DoctorService,
    public settigService: SettignService,
    public roleService: RolesService,
    public router: Router
  ){

  }

  ngOnInit(): void {
    this.doctorService.closeMenuSidebar();
    window.scrollTo(0, 0);
    let USER = localStorage.getItem("user");
    this.user = JSON.parse(USER ? USER: '');
    this.doctor_id = this.user.id;
    this.user = this.roleService.authService.user;
    this.roles = this.user.roles[0];
    // console.log(this.doctor_id);

    this.appointmentService.listConfig().subscribe((resp:any)=>{
      this.hours = resp.hours;
      this.specialities = resp.specialities;
    })

    this.getTiposdePago();
  }
  
  filtro(){
    let data = {
      date_appointment:this.date_appointment,
      hour:this.hour,
      speciality_id:this.speciality_id
    }
    this.appointmentService.lisFiter(data).subscribe((resp:any)=>{
      // console.log(resp);
      this.DOCTORS = resp.doctors;
    })
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
      this.patient = resp;
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

  save(){debugger
    this.text_validation = '';

    if(this.amount < this.amount_add){
      this.text_validation = "El Monto ingresado como adelanto no puede ser mayor al costo de la cita medica";
      return;
    }
    if(!this.name ||!this.surname|| !this.n_doc || !this.phone 
      || !this.date_appointment|| !this.speciality_id 
      || !this.selected_segment_hour || !this.amount 
      || !this.amount_add || !this.method_payment){
      this.text_validation = "Los campos son Necesarios(Segmento de hora, fecha, especialidad, paciente, pago)";
      return;
    }

    let data ={
      "doctor_id": this.DOCTOR_SELECTED.doctor.id,
        // "patient_id": ,
        user_id:this.patient.id,
        name: this.name,
        surname: this.surname,
        n_doc: this.n_doc,
        phone: this.phone,
        name_companion: this.name_companion,
        surname_companion: this.surname_companion,
        "date_appointment": this.date_appointment,
        "speciality_id": this.speciality_id,
        "doctor_schedule_join_hour_id": this.selected_segment_hour.id,
        amount:this.amount,
        amount_add:this.amount_add,
        method_payment:this.method_payment,
    }

    this.appointmentService.storeAppointment(data).subscribe((resp:any)=>{
      // console.log(resp);
      // this.text_success = "La Cita medica se ha creado";
      this.router.navigate(['/appointments/list']);
    })
  }


  getTiposdePago(){
    this.settigService.getActivas().subscribe((resp:any)=>{
      console.log(resp);
      this.tiposdepagos = resp.tiposdepagos;
      // console.log(this.tiposdepagos);
    })
}


}
