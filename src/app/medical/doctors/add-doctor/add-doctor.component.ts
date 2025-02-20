import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { routes } from 'src/app/shared/routes/routes';
import { StaffService } from '../../staff/service/staff.service';
import { DoctorService } from '../service/doctor.service';

@Component({
  selector: 'app-add-doctor',
  templateUrl: './add-doctor.component.html',
  styleUrls: ['./add-doctor.component.scss']
})
export class AddDoctorComponent {
  public routes = routes;
  public selectedValue!: string;
  public selectedValueLocation!: string;

  public name = '';
  public surname = '';
  public mobile: any;
  public email = '';
  public password = '';
  public password_confirmation = '';
  public birth_date = '';
  public gender = 1;
  public education = '';
  public designation = '';
  public address = '';

  public roles:any = [];
  public FILE_AVATAR:any;
  public IMAGE_PREVISUALIZA:any = 'assets/img/user-06.jpg';

  valid_form = false;
  valid_form_success = false;

  public text_success = '';
  public text_validation = '';
  public precio_cita:number ;

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

  

  constructor(
    public doctorService:DoctorService,
    public router: Router
  ){

  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.doctorService.closeMenuSidebar();
    this.getConfig();
  }

  getConfig(){
    this.doctorService.listConfig().subscribe((resp:any)=>{
      // console.log(resp);
      this.roles = resp.roles;
      this.specialities = resp.specialities;
      this.locations = resp.locations;
      this.hours_days = resp.hours_days;
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
    if(!this.name||!this.email ||!this.surname ){
      this.text_validation = 'Los campos con * son obligatorios';
      return;
    }

    if(this.password != this.password_confirmation  ){
      this.text_validation = 'Las contraseña debe ser igual';
      return;
    }
    if(this.hours_selecteds.length == 0 ){
      this.text_validation = 'Se requiere un horario';
      return;
    }

    console.log(this.selectedValue);

    const formData = new FormData();
    formData.append('name', this.name);
    formData.append('surname', this.surname);
    formData.append('mobile', this.mobile);
    formData.append('email', this.email);
    formData.append('password', this.password);
    formData.append('birth_date', this.birth_date);
    formData.append('gender', this.gender+'');
    formData.append('education', this.education);
    formData.append('designation', this.designation);
    formData.append('address', this.address);
    formData.append('role_id', this.selectedValue);
    formData.append('speciality_id', this.speciality_id);
    formData.append('imagen', this.FILE_AVATAR);
    formData.append('location_id', this.selectedValueLocation);
    formData.append('precio_cita', this.precio_cita+'');
    const HOUR_SCHEDULES:any = [];

    this.days_week.forEach((day:any) => {
      const DAYS_HOURS = this.hours_selecteds.filter((hour_select:any) => hour_select.day_name == day.day);
      HOUR_SCHEDULES.push({
        day_name: day.day,
        children: DAYS_HOURS,
      });
      
    })
    formData.append("schedule_hours",JSON.stringify(HOUR_SCHEDULES));

    this.doctorService.storeDoctor(formData).subscribe((resp:any)=>{
      // console.log(resp);
      
      if(resp.message == 403){
        this.text_validation = resp.message_text;
      }else{
        // this.text_success = 'El usuario ha sido registrado correctamente';


        // this.name = '';
        // this.surname = '';
        // this.mobile = '';
        // this.email = '';
        // this.password = '';
        // this.birth_date = '';
        // this.education = '';
        // this.designation = '';
        // this.address = '';
        // this.selectedValue = '';
        // this.valid_form_success = true;
        this.router.navigate(['/doctors/list']);
      }
    })


  }

  addHourItem(hours_day:any,day:any,item:any){
    const INDEX = this.hours_selecteds.findIndex(
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
    const INDEX = this.hours_selecteds.findIndex(
      (hour:any) => hour.day_name == day.day 
        && hour.hour == hours_day.hour 
        && hour.grupo == "all");

    const COUNT_SELECTED = this.hours_selecteds.filter(
          (hour:any) => hour.day_name == day.day 
            && hour.hour == hours_day.hour).length;

    if(INDEX != -1 && COUNT_SELECTED == hours_day.items.length){
      hours_day.items.forEach((item:any) => {
        const INDEX = this.hours_selecteds.findIndex(
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
        const INDEX = this.hours_selecteds.findIndex(
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
      const INDEX = this.hours_selecteds.findIndex((hour:any) => hour.hour == hours_day.hour);
      
      if(INDEX != -1 && !$event.currentTarget.checked){
        this.days_week.forEach((day) => {
          hours_day.items.forEach((item:any) => { 
            const INDEX = this.hours_selecteds.findIndex((hour:any) => hour.day_name == day.day 
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
            const INDEX = this.hours_selecteds.findIndex((hour:any) => hour.day_name == day.day 
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
      const INDEX = this.hours_selecteds.findIndex(
        (hour:any) => hour.day_name == day.day 
          && hour.hour == hours_day.hour 
          && hour.grupo == "all");
  
      const COUNT_SELECTED = this.hours_selecteds.filter(
            (hour:any) => hour.day_name == day.day 
              && hour.hour == hours_day.hour).length;
  
        if(INDEX != -1 && COUNT_SELECTED == hours_day.items.length){
          return true;
        }else{
          return false
        }
      }


      isCheckedHour(hours_day:any,day:any,item:any){
        const INDEX = this.hours_selecteds.findIndex(
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
