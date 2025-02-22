import { Component } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { DataService } from 'src/app/shared/data/data.service';
import { routes } from 'src/app/shared/routes/routes';
import { DoctorService } from '../service/doctor.service';
import { ActivatedRoute } from '@angular/router';
import { RolesService } from '../../roles/service/roles.service';
import { AuthService } from 'src/app/shared/auth/auth.service';

@Component({
  selector: 'app-profile-doctor',
  templateUrl: './profile-doctor.component.html',
  styleUrls: ['./profile-doctor.component.scss']
})
export class ProfileDoctorComponent {
  public routes = routes;
public doctorProfile: any[];
option_selected = 1;
public doctor_id: any;

public num_appointment = 0;
public money_of_appointments = 0;
public num_appointment_pendings = 0;
public doctor_selected: any;
public user: any;
public appointment_pendings: any =[];
public appointments: any =[];
name='';
surname='';
mobile='';
email='';
address='';
password='';
password_repeat='';

public text_success = '';
public text_validation = '';

doctor:any;
constructor(
  public doctorService: DoctorService,
  public activatedRoute: ActivatedRoute,
  public roleService: RolesService,
  public authService: AuthService,
  )
{
}

ngOnInit(): void {
  window.scrollTo(0, 0);
  this.doctorService.closeMenuSidebar();
  this.activatedRoute.params.subscribe((resp:any)=>{
    // console.log(resp);
    this.doctor_id = resp.id;
    
  });
  this.getDoctor();
  this.user = this.roleService.authService.user;
}

isPermission(permission:string){
  if(this.user.roles.includes('SUPERADMIN')){
    return true;
  }
  if(this.user.permissions.includes(permission)){
    return true;
  }
  return false;
}
onLogout() {
  this.authService.logout();
}

getDoctor(){
  this.doctorService.showDoctorProfile(this.doctor_id).subscribe((resp:any)=>{
    console.log(resp);
    this.doctor = resp.doctor;
    this.num_appointment= resp.num_appointment;
    this.money_of_appointments= resp.money_of_appointments;
    this.num_appointment_pendings= resp.num_appointment_pendings;
    this.doctor_selected= resp.doctor;
    this.appointment_pendings= resp.appointment_pendings.data;
    this.appointments= resp.appointments;

    this.name= this.doctor_selected.name;
    this.surname= this.doctor_selected.surname;
    this.mobile= this.doctor_selected.mobile;
    this.email= this.doctor_selected.email;
    this.address= this.doctor_selected.address;

  })
}

  optionSelected(value:number){
    this.option_selected = value;
  }

  update(){
    this.text_validation = '';
    this.text_success = '';
    if(!this.name||!this.email ||!this.surname ){
      this.text_validation = 'Los campos con * son obligatorios';
      return;
    }

    if(this.password ){
      if(this.password != this.password_repeat  ){
        this.text_validation = 'Las contraseña debe ser igual';
        return;
      }
    }

    const data:any ={
      name: this.name,
      surname: this.surname,
      mobile: this.mobile,
      email: this.email,
      address: this.address,
    }

    if(this.password){
      data.password = this.password
    }
    this.doctorService.editDoctorProfile(data, this.doctor_id).subscribe((resp:any)=>{
      // console.log(resp);
      
      if(resp.message == 403){
        this.text_validation = resp.message_text;
      }else{
        this.text_success = 'El usuario ha sido actualizado correctamente';
        this.ngOnInit();
      }
    })
  }
}
