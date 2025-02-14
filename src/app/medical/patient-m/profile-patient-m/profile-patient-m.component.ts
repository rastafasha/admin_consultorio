import { Component } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/shared/data/data.service';
import { patientProfile } from 'src/app/shared/models/models';
import { routes } from 'src/app/shared/routes/routes';
import { PatientMService } from '../service/patient-m.service';
import { DoctorService } from '../../doctors/service/doctor.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-profile-patient-m',
  templateUrl: './profile-patient-m.component.html',
  styleUrls: ['./profile-patient-m.component.scss']
})
export class ProfilePatientMComponent {
  public routes = routes;
  imagenSerUrl = environment.url_media;
public patientProfile: any[];
option_selected = 1;
public patient_id: any;
public roles: any;
public user: any;

public num_appointment = 0;
public money_of_appointments = 0;
public num_appointment_pendings = 0;
public patient_selected: any;
public appointment_pendings: any =[];
public appointments: any =[];


public text_success = '';
public text_validation = '';

constructor(
  public patientService : PatientMService,
  public activatedRoute: ActivatedRoute,
  public doctorService: DoctorService,
  )
{
}
ngOnInit(): void {
  window.scrollTo(0, 0);
  this.doctorService.closeMenuSidebar();
  this.activatedRoute.params.subscribe((resp:any)=>{
    // console.log(resp);
    this.patient_id = resp.id;
  });
  const USER = localStorage.getItem('user');
  this.user = JSON.parse(USER ? USER : '');
  this.roles = this.user.roles[0];
  this.getDoctor();
}

getDoctor(){
  this.patientService.showPatientProfile(this.patient_id).subscribe((resp:any)=>{
    console.log(resp);
    // this.appointments= resp.appointments;
    // this.num_appointment= resp.num_appointment;
    // this.money_of_appointments= resp.money_of_appointments;
    // this.num_appointment_pendings= resp.num_appointment_pendings;
    // this.patient_selected= resp.patient;
    // this.appointment_pendings= resp.appointment_pendings.data;


  })
}


  optionSelected(value:number){
    this.option_selected = value;
  }
}
