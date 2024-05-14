import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { routes } from 'src/app/shared/routes/routes';
import { DoctorService } from '../service/doctor.service';

@Component({
  selector: 'app-edit-doctor',
  templateUrl: './edit-doctor.component.html',
  styleUrls: ['./edit-doctor.component.scss']
})
export class EditDoctorComponent {
  public routes = routes;
  public selectedValue!: string;
  public selectedValueLocation!: string;

  public name: string = '';
  public surname: string = '';
  public mobile: any;
  public email: string = '';
  public password: string = '';
  public password_confirmation: string = '';
  public birth_date: string = '';
  public gender: number = 1;
  public precio_cita: number;
  public education: string = '';
  public designation: string = '';
  public address: string = '';

  public roles:any = [];
  public FILE_AVATAR:any;
  public IMAGE_PREVISUALIZA:any = 'assets/img/user-06.jpg';

  valid_form:boolean = false;
  valid_form_success:boolean = false;

  public text_success:string = '';
  public text_validation:string = '';

  public speciality_id:any;
  public specialities:any = [];
  public locations:any = [];
  public hours_days:any =[];
  public hours_selecteds:any = [];
  public days_week = [
    {
      day:'Lunes',
      class: 'table-primary'
    },
    {
      day:'Martes',
      class: 'table-secondary'
    },
    {
      day:'Miercoles',
      class: 'table-success'
    },
    {
      day:'Jueves',
      class: 'table-warning'
    },
    {
      day:'Viernes',
      class: 'table-info'
    },
  ];

  public doctor_id:any;
  public doctor_selected:any;

  constructor(
    public doctorService:DoctorService,
    public router: Router,
    public activatedRoute:ActivatedRoute
  ){

  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.activatedRoute.params.subscribe((resp:any)=>{
      // console.log(resp);
      this.doctor_id = resp.id;
    });

    this.getConfig();
  }

  getConfig(){
    this.doctorService.listConfig().subscribe((resp:any)=>{
      // console.log(resp);
      this.roles = resp.roles;
      this.specialities = resp.specialities;
      this.locations = resp.locations;
      this.hours_days = resp.hours_days;

      this.doctorService.showDoctor(this.doctor_id).subscribe((resp:any)=>{
        // console.log(resp);
        this.doctor_selected = resp.user;

        this.selectedValue = this.doctor_selected.roles.id;
        this.selectedValueLocation = this.doctor_selected.location_id;

        this.speciality_id = this.doctor_selected.speciality.id;
        this.name = this.doctor_selected.name;
        this.surname = this.doctor_selected.surname;
        this.mobile = this.doctor_selected.mobile;
        this.email = this.doctor_selected.email;
        this.birth_date = new Date(this.doctor_selected.birth_date).toISOString();
        this.education = this.doctor_selected.education;
        this.designation = this.doctor_selected.designation;
        this.gender = this.doctor_selected.gender;
        this.address = this.doctor_selected.address;
        this.IMAGE_PREVISUALIZA = this.doctor_selected.avatar;
        this.hours_selecteds = this.doctor_selected.schedule_selecteds;
      })
      
    })
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
    this.text_success = '';
    if(!this.name||!this.email ||!this.surname ){
      this.text_validation = 'Los campos con * son obligatorios';
      return;
    }

    if(this.password ){
      if(this.password != this.password_confirmation  ){
        this.text_validation = 'Las contraseña debe ser igual';
        return;
      }
    }
    if(this.hours_selecteds.length == 0 ){
      this.text_validation = 'Se requiere un horario';
      return;
    }

    console.log(this.selectedValue);

    let formData = new FormData();
    formData.append('name', this.name);
    formData.append('surname', this.surname);
    formData.append('mobile', this.mobile);
    formData.append('email', this.email);
    formData.append('birth_date', this.birth_date);
    formData.append('gender', this.gender+'');
    formData.append('speciality_id', this.speciality_id);

    if(this.selectedValue ){
      formData.append('role_id', this.selectedValue);
    }
    if(this.education ){
      formData.append('education', this.education);
    }
    if(this.address ){
      formData.append('address', this.address);
    }
    if(this.designation ){
      formData.append('designation', this.designation);
    }
    if(this.precio_cita ){
      formData.append('precio_cita', this.precio_cita+'');
    }

    // if(this.selectedValueLocation ){
    //   formData.append('location_id', this.selectedValueLocation);
    // }
    
    if(this.password ){
      formData.append('password', this.password);
    }
    this.FILE_AVATAR  = this.IMAGE_PREVISUALIZA;
    if(this.FILE_AVATAR ){
      formData.append('imagen', this.FILE_AVATAR);
    }

    let HOUR_SCHEDULES:any = [];

    this.days_week.forEach((day:any) => {
      let DAYS_HOURS = this.hours_selecteds.filter((hour_select:any) => hour_select.day_name == day.day);
      HOUR_SCHEDULES.push({
        day_name: day.day,
        children: DAYS_HOURS,
      });
      
    })
    formData.append("schedule_hours",JSON.stringify(HOUR_SCHEDULES));

    this.doctorService.editDoctor(formData, this.doctor_id).subscribe((resp:any)=>{
      // console.log(resp);
      
      if(resp.message == 403){
        this.text_validation = resp.message_text;
      }else{
        this.text_success = 'El usuario ha sido actualizado correctamente';
      }
    })


  }

  addHourItem(hours_day:any,day:any,item:any){
    let INDEX = this.hours_selecteds.findIndex(
                  (hour:any) => hour.day_name == day.day //saber si se encuentra en el mismodia
                    && hour.hour == hours_day.hour 
                    && hour.item.hour_start == item.hour_start 
                    && hour.item.hour_end == item.hour_end
                    );
    if(INDEX != -1){
      this.hours_selecteds.splice(INDEX,1);
    }else{
      this.hours_selecteds.push({
        "day": day,
        "day_name": day.day,
        "hours_day": hours_day,
        "hour": hours_day.hour,
        "grupo": "none",
        "item": item,
      });
    }     
    console.log(this.hours_selecteds);         
  }

  addHourAll(hours_day:any,day:any){
    let INDEX = this.hours_selecteds.findIndex(
      (hour:any) => hour.day_name == day.day 
        && hour.hour == hours_day.hour 
        && hour.grupo == "all");

    let COUNT_SELECTED = this.hours_selecteds.filter(
          (hour:any) => hour.day_name == day.day 
            && hour.hour == hours_day.hour).length;

    if(INDEX != -1 && COUNT_SELECTED == hours_day.items.length){
      hours_day.items.forEach((item:any) => {
        let INDEX = this.hours_selecteds.findIndex(
          (hour:any) => hour.day_name == day.day //saber si se encuentra en el mismodia
            && hour.hour == hours_day.hour 
            && hour.item.hour_start == item.hour_start 
            && hour.item.hour_end == item.hour_end
            );
        if(INDEX != -1){
          this.hours_selecteds.splice(INDEX,1);
        }    
      });
      
    }else{
      hours_day.items.forEach((item:any) => {
        let INDEX = this.hours_selecteds.findIndex(
          (hour:any) => hour.day_name == day.day //saber si se encuentra en el mismodia
            && hour.hour == hours_day.hour 
            && hour.item.hour_start == item.hour_start 
            && hour.item.hour_end == item.hour_end
            );
        if(INDEX != -1){
          this.hours_selecteds.splice(INDEX,1);
        }    
        this.hours_selecteds.push({
          "day": day,
          "day_name": day.day,
          "hours_day": hours_day,
          "hour": hours_day.hour,
          "grupo": "all",
          "item": item,
          });
      });
    
    }     
    console.log(this.hours_selecteds); 
  }
  
  

    addHourAllDay($event:any,hours_day:any){
      let INDEX = this.hours_selecteds.findIndex((hour:any) => hour.hour == hours_day.hour);
      
      if(INDEX != -1 && !$event.currentTarget.checked){
        this.days_week.forEach((day) => {
          hours_day.items.forEach((item:any) => { 
            let INDEX = this.hours_selecteds.findIndex((hour:any) => hour.day_name == day.day 
                                    && hour.hour == hours_day.hour 
                                    && hour.item.hour_start == item.hour_start && hour.item.hour_end == item.hour_end);
            if(INDEX != -1){
              this.hours_selecteds.splice(INDEX,1);
            }
          });
        })
      }else{
        this.days_week.forEach((day) => {
          hours_day.items.forEach((item:any) => { 
            let INDEX = this.hours_selecteds.findIndex((hour:any) => hour.day_name == day.day 
                                    && hour.hour == hours_day.hour 
                                    && hour.item.hour_start == item.hour_start && hour.item.hour_end == item.hour_end);
            if(INDEX != -1){
              this.hours_selecteds.splice(INDEX,1);
            }
          });
        })
        setTimeout(() => {
          this.days_week.forEach((day) => {
            this.addHourAll(hours_day,day);
          })
        }, 25);
      }
  
    }

    isCheckedHourAll(hours_day:any,day:any){
      let INDEX = this.hours_selecteds.findIndex(
        (hour:any) => hour.day_name == day.day 
          && hour.hour == hours_day.hour 
          && hour.grupo == "all");
  
      let COUNT_SELECTED = this.hours_selecteds.filter(
            (hour:any) => hour.day_name == day.day 
              && hour.hour == hours_day.hour).length;
  
        if(INDEX != -1 && COUNT_SELECTED == hours_day.items.length){
          return true;
        }else{
          return false
        }
      }


      isCheckedHour(hours_day:any,day:any,item:any){
        let INDEX = this.hours_selecteds.findIndex(
          (hour:any) => hour.day_name == day.day //saber si se encuentra en el mismodia
            && hour.hour == hours_day.hour 
            && hour.item.hour_start == item.hour_start 
            && hour.item.hour_end == item.hour_end
            );
          if(INDEX != -1){
            return true;
          }else{
            return false;
          }
        }
}
