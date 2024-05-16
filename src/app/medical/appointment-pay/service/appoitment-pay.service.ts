import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { url_servicios } from 'src/app/config/config';
import { AuthService } from 'src/app/shared/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AppoitmentPayService {

  constructor(
    public http: HttpClient,
    public authService: AuthService,

  ) { }

  listConfig(){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
    let URL = url_servicios+'/appointment/config';
    return this.http.get(URL, {headers:headers});
  }

  listAppointmentPays(page:number=1, 
                      search_doctor:string='', 
                      search_patient:string='', 
                      speciality_id:number=0, 
                      date_start:string= '',
                      date_end:string= '',
                      ){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    let LINK = "";
    if(search_doctor){
      LINK+="&search_doctor="+search_doctor;
    }
    if(search_patient){
      LINK+="&search_patient="+search_patient;
    }
    if(speciality_id){
      LINK+="&speciality_id="+speciality_id;
    }
    if(date_start){
      LINK+="&date_start="+date_start;
    }
    if(date_end){
      LINK+="&date_end="+date_end;
    }
    let URL = url_servicios+'/appointmentpay?page='+page+LINK;
    return this.http.get(URL, {headers:headers});
  }

  listAppointmentPaysByDoctor(
    doctor_id:any='', 
    page:number=1, 
    search_patient:string='', 
    date_start:string= '',
    date_end:string= '',
    ){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    let LINK = "";
    
    if(search_patient){
    LINK+="&search_patient="+search_patient;
    }
    if(date_start){
    LINK+="&date_start="+date_start;
    }
    if(date_end){
    LINK+="&date_end="+date_end;
    }
    let URL = url_servicios+'/appointmentpay/byDoctor/'+doctor_id+'/?page='+page+LINK;
    return this.http.get(URL, {headers:headers});
  }

  storeAppointmentPay(data:any){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    let URL = url_servicios+"/appointmentpay/store";
    return this.http.post(URL,data, {headers:headers});
  }

  getAppointmentPaybyDoctor(doctor_id:number) {
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    let URL = url_servicios+"/appointmentpay/byDoctor/"+doctor_id;
    return this.http.put(URL,{headers:headers});
  }

  editAppointmentPay(data:any, appointmentpay_id:any){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    let URL = url_servicios+"/appointmentpay/update/"+appointmentpay_id;
    return this.http.put(URL,data,{headers:headers});
  }
  
  deleteAppointmentPay(appointmentpay_id:any){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    let URL = url_servicios+"/appointmentpay/destroy/"+appointmentpay_id;
    return this.http.delete(URL, {headers:headers});
  }

  
}
