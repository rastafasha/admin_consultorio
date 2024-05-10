import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { url_servicios } from 'src/app/config/config';
import { AuthService } from 'src/app/shared/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PatientMService {

  constructor(
    public http: HttpClient,
    public authService:AuthService
  ) { }

  listPatients(page:number=1, search:string=''){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
    let URL = url_servicios+'/patients?page='+page+"&search="+search;
    return this.http.get(URL, {headers:headers});
  }

  getPatientsByDoctor(doctor_id:any){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
    let URL = url_servicios+'/patients/byDoctor/'+doctor_id;
    return this.http.get(URL, {headers:headers});
  }
  
  getPatient(user_id:any){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
    let URL = url_servicios+'/patients/show/'+user_id;
    return this.http.get(URL, {headers:headers});
  }
  createPatient(data){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
    let URL = url_servicios+'/patients/store';
    return this.http.post(URL,data, {headers:headers});
  }
  editPatient( data:any, user_id:any,){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
    let URL = url_servicios+'/patients/update/'+user_id;
    return this.http.post(URL,data,{headers:headers});
  }
  deletePatient(user_id:any){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
    let URL = url_servicios+'/patients/destroy/'+user_id;
    return this.http.delete(URL, {headers:headers});
  }

  showPatientProfile(user_id:any){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    let URL = url_servicios+"/patients/profile/"+user_id;
    return this.http.get(URL,{headers:headers});
  }

  listConfig(){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
    let URL = url_servicios+'/patients/config';
    return this.http.get(URL, {headers:headers});
  }
  
}
