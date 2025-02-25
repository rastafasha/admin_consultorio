import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import Link from 'ngx-editor/lib/commands/Link';
import { url_servicios } from 'src/app/config/config';
import { AuthService } from 'src/app/shared/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  constructor(
    public http: HttpClient,
    public authService: AuthService,

  ) { }

  listConfig(){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
    const URL = url_servicios+'/appointments/config';
    return this.http.get(URL, {headers:headers});
  }

  lisFiter(data:any){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    const URL = url_servicios+"/appointments/filter";
    return this.http.post(URL,data, {headers:headers});
  }
  lisFiterByDoctor(data:any, doctor_id:number){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    const URL = url_servicios+"/appointments/filterbydoctor/"+doctor_id;
    return this.http.post(URL,data, {headers:headers});
  }
  pendings(){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    const URL = url_servicios+"/appointments/pendientes";
    return this.http.get(URL, {headers:headers});
  }
  pendingsbyDoctor(doctor_id:number){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    const URL = url_servicios+"/appointments/pendientesbydoctor/"+doctor_id;
    return this.http.get(URL, {headers:headers});
  }

  getPatient(n_doc =''){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    const URL = url_servicios+"/appointments/patient?n_doc="+n_doc;
    return this.http.get(URL, {headers:headers});
  }
  listAppointments(page=1, search='', speciality_id=0,date= ''){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    let LINK = "";
    if(search){
      LINK+="&search="+search;
    }
    if(speciality_id){
      LINK+="&speciality_id="+speciality_id;
    }
    if(date){
      LINK+="&date="+date;
    }
    const URL = url_servicios+'/appointment?page='+page+LINK;
    return this.http.get(URL, {headers:headers});
  }
  listAppointmentDocts(
    doctor_id:any, 
    page=1, 
    search='', 
    search_patient='',
    date= '',
  ){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    let LINK = "";
    if(search){
      LINK+="&search="+search;
    }
    if(search_patient){
      LINK+="&search_patient="+search_patient;
      }
    
    if(date){
      LINK+="&date="+date;
    }
    
    const URL = url_servicios+'/appointments/byDoctor/'+doctor_id+'/?page='+page+LINK;
    return this.http.get(URL, {headers:headers});
  }

  

  storeAppointment(data:any){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    const URL = url_servicios+"/appointment/store";
    return this.http.post(URL,data, {headers:headers});
  }
  showAppointment(appointment_id:any){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    const URL = url_servicios+"/appointments/show/"+appointment_id;
    return this.http.get(URL,{headers:headers});
  }
  editAppointment(data:any, appointment_id:any){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    const URL = url_servicios+"/appointments/update/"+appointment_id;
    return this.http.put(URL,data,{headers:headers});
  }
  deleteAppointment(appointment_id:any){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    const URL = url_servicios+"/appointments/destroy/"+appointment_id;
    return this.http.delete(URL, {headers:headers});
  }
  updateConfirmation(data:any, appointment_id:any){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    const URL = url_servicios+"/appointments/update/cofirmation/"+appointment_id;
    return this.http.put(URL,data,{headers:headers});
  }

  //cita medica
  registerAttention(data:any){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    const URL = url_servicios+"/appointment-atention/store";
    return this.http.post(URL,data, {headers:headers});
  }
  registerAttentionLocal(data:any){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    const URL = url_servicios+"/appointment-atention/store-local";
    return this.http.post(URL,data, {headers:headers});
  }

  showCitamedica(appointment_id:any){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    const URL = url_servicios+"/appointment-atention/show/"+appointment_id;
    return this.http.get(URL,{headers:headers});
  }
  cancelAppointment(appointment_id:any){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    const URL = url_servicios+"/appointments/cancel/"+appointment_id;
    return this.http.delete(URL, {headers:headers});
  }
}
