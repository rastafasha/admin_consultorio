import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { url_servicios } from 'src/app/config/config';
import { AuthService } from 'src/app/shared/auth/auth.service';

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

  showSpecialities(role_id:string){
    const headers = new HttpHeaders({'Authorization': 'Bearer '+this.authService.token});
    const URL = url_servicios+"/specialitie/show/"+role_id;
    return this.http.get(URL,{headers: headers});
  }
  showSpeciality(id:number){
    const headers = new HttpHeaders({'Authorization': 'Bearer '+this.authService.token});
    const URL = url_servicios+"/specialitie/show/"+id;
    return this.http.get(URL,{headers: headers});
  }

  storeSpecialities(data:any){
    const headers = new HttpHeaders({'Authorization': 'Bearer '+this.authService.token});
    const URL = url_servicios+"/specialitie/store";
    return this.http.post(URL,data,{headers: headers});
  }

  editSpecialities(data:any,id_specialitie:any){
    const headers = new HttpHeaders({'Authorization': 'Bearer '+this.authService.token});
    const URL = url_servicios+"/specialitie/update/"+id_specialitie;
    return this.http.put(URL,data,{headers: headers});
  }

  deleteSpecialities(id_specialitie:any){
    const headers = new HttpHeaders({'Authorization': 'Bearer '+this.authService.token});
    const URL = url_servicios+"/specialitie/destroy/"+id_specialitie;
    return this.http.delete(URL,{headers: headers});
  }
  
}
