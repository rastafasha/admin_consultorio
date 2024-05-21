import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { url_servicios } from 'src/app/config/config';
import { AuthService } from 'src/app/shared/auth/auth.service';
declare var $:any;

@Injectable({
  providedIn: 'root'
})
export class DoctorService {

  constructor(
    public http: HttpClient,
    public authService: AuthService,

  ) { }

  

  listDoctors(){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    let URL = url_servicios+"/doctors";
    return this.http.get(URL, {headers:headers});
  }
  listConfig(){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
    let URL = url_servicios+'/doctors/config';
    return this.http.get(URL, {headers:headers});
  }
  storeDoctor(data:any){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    let URL = url_servicios+"/doctors/store";
    return this.http.post(URL,data, {headers:headers});
  }
  showDoctor(doctor_id:any){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    let URL = url_servicios+"/doctors/show/"+doctor_id;
    return this.http.get(URL,{headers:headers});
  }
  editDoctor(data:any, doctor_id:any){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    let URL = url_servicios+"/doctors/update/"+doctor_id;
    return this.http.post(URL,data,{headers:headers});
  }
  
  showDoctorProfile(doctor_id:any){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    let URL = url_servicios+"/doctors/profile/"+doctor_id;
    return this.http.get(URL,{headers:headers});
  }
  editDoctorProfile(data:any, doctor_id:any){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    let URL = url_servicios+"/staffs/update/"+doctor_id;
    return this.http.post(URL,data,{headers:headers});
  }


  yo(user:any){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    // let headers = this.headers;
    let URL = url_servicios+'/me';
    return this.http.post(URL,user, {headers: headers})
  }
  
  
  deleteDoctor(doctor_id:any){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    let URL = url_servicios+"/doctors/destroy/"+doctor_id;
    return this.http.delete(URL, {headers:headers});
  }

  closeMenuSidebar(){
    $('.sidebar').addClass("cerrar");
    $('.menu-opened').remove("menu-opened");
  }

  updateStatus(data:any, doctor_id:any){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    let URL = url_servicios+"/doctors/update/status/"+doctor_id;
    return this.http.put(URL,data,{headers:headers});
  }
}
