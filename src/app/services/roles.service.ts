import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { url_servicios } from '../config/config';
import { AuthService } from '../shared/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  constructor(
    public http: HttpClient,
    public authService: AuthService,

  ) { }

  listRoles(){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    const URL = url_servicios+"/roles";
    return this.http.get(URL, {headers:headers});
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  storeRole(data:any){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    const URL = url_servicios+"/roles/store";
    return this.http.post(URL,data, {headers:headers});
  }
  getRole(role_id:number){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    const URL = url_servicios+"/roles/show/"+role_id;
    return this.http.get(URL,{headers:headers});
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editRole(data:any, role_id:number){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    const URL = url_servicios+"/roles/update/"+role_id;
    return this.http.put(URL,data,{headers:headers});
  }

  
  
  deconsteRole(role_id:number){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    const URL = url_servicios+"/roles/destroy/"+role_id;
    return this.http.delete(URL, {headers:headers});
  }

}
