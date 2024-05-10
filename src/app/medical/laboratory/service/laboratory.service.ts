import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { url_servicios } from 'src/app/config/config';
import { AuthService } from 'src/app/shared/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class LaboratoryService {

  constructor(
    public http: HttpClient,
    public authService: AuthService,

  ) { }

  

  listAppointments(page:number=1, search:string='', speciality_id:number=0,date:string= ''){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
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
    let URL = url_servicios+'/laboratory?page='+page+LINK;
    return this.http.get(URL, {headers:headers});
  }

  getLaboratorys(){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    let URL = url_servicios+"/laboratory";
    return this.http.get(URL, {headers:headers});
  }
  
  storeLaboratory(data:any){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    let URL = url_servicios+"/laboratory/store";
    return this.http.post(URL,data, {headers:headers});
  }

  getLaboratoryByAppointment(appointment_id:any){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    let URL = url_servicios+"/laboratory/showByAppointment/"+appointment_id;
    return this.http.get(URL,{headers:headers});
  }

  editLaboratory(data:any, laboratory_id:any){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    let URL = url_servicios+"/laboratory/update/"+laboratory_id;
    return this.http.post(URL,data,{headers:headers});
  }

  
  
  deleteLaboratory(laboratory_id:any){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    let URL = url_servicios+"/laboratory/destroy/"+laboratory_id;
    return this.http.delete(URL, {headers:headers});
  }

}
