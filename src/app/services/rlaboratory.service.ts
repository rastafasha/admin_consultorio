import { Injectable } from '@angular/core';
import { url_servicios } from '../config/config';
import { AuthService } from '../shared/auth/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RLaboratoryService {

   constructor(
    public http: HttpClient,
    public authService: AuthService,

  ) { }

  

  
  getLaboratorys(){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    const URL = url_servicios+"/rlaboratory";
    return this.http.get(URL, {headers:headers});
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  storeRLaboratory(data:any){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    const URL = url_servicios+"/rlaboratory/store";
    return this.http.post(URL,data, {headers:headers});
  }

  getRLaboratoryByPatient(patient_id:number){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    const URL = url_servicios+"/rlaboratory/showByPatient/"+patient_id;
    return this.http.get(URL,{headers:headers});
  }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  editRLaboratory(data:any, laboratory_id:number){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    const URL = url_servicios+"/rlaboratory/update/"+laboratory_id;
    return this.http.post(URL,data,{headers:headers});
  }

  
  
  deleteRLaboratory(laboratory_id:number){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    const URL = url_servicios+"/rlaboratory/delete-file/"+laboratory_id;
    return this.http.delete(URL, {headers:headers});
  }
  destroyRLaboratory(laboratory_id:number){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    const URL = url_servicios+"/rlaboratory/destroy/"+laboratory_id;
    return this.http.delete(URL, {headers:headers});
  }
}
