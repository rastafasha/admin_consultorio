import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { url_servicios } from '../config/config';
import { AuthService } from '../shared/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SpecialitieService {

  constructor(
    public http: HttpClient,
    public authService: AuthService,
  ) { }

  listSpecialities(){
    const headers = new HttpHeaders({'Authorization': 'Bearer '+this.authService.token});
    const URL = url_servicios+"/specialities";
    return this.http.get(URL,{headers: headers});
  }

  showSpecialities(role_id:number){
    const headers = new HttpHeaders({'Authorization': 'Bearer '+this.authService.token});
    const URL = url_servicios+"/specialities/show/"+role_id;
    return this.http.get(URL,{headers: headers});
  }
  showSpeciality(id:number){
    const headers = new HttpHeaders({'Authorization': 'Bearer '+this.authService.token});
    const URL = url_servicios+"/specialities/show/"+id;
    return this.http.get(URL,{headers: headers});
  }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  storeSpecialities(data:any){
    const headers = new HttpHeaders({'Authorization': 'Bearer '+this.authService.token});
    const URL = url_servicios+"/specialities/store";
    return this.http.post(URL,data,{headers: headers});
  }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  editSpecialities(data:any,id_specialitie:number){
    const headers = new HttpHeaders({'Authorization': 'Bearer '+this.authService.token});
    const URL = url_servicios+"/specialities/update/"+id_specialitie;
    return this.http.put(URL,data,{headers: headers});
  }

  deleteSpecialities(id_specialitie:number){
    const headers = new HttpHeaders({'Authorization': 'Bearer '+this.authService.token});
    const URL = url_servicios+"/specialities/destroy/"+id_specialitie;
    return this.http.delete(URL,{headers: headers});
  }
  
}
