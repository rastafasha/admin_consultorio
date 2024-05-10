import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { url_servicios } from 'src/app/config/config';
import { AuthService } from 'src/app/shared/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  constructor(
    public http: HttpClient,
    public authService: AuthService,

  ) { }

  listRoles(){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    let URL = url_servicios+"/roles";
    return this.http.get(URL, {headers:headers});
  }
  storeRole(data:any){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    let URL = url_servicios+"/roles/store";
    return this.http.post(URL,data, {headers:headers});
  }
  getRole(role_id:any){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    let URL = url_servicios+"/roles/show/"+role_id;
    return this.http.get(URL,{headers:headers});
  }
  editRole(data:any, role_id:any){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    let URL = url_servicios+"/roles/update/"+role_id;
    return this.http.put(URL,data,{headers:headers});
  }

  
  
  deleteRole(role_id:any){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    let URL = url_servicios+"/roles/destroy/"+role_id;
    return this.http.delete(URL, {headers:headers});
  }

}
