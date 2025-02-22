import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { url_servicios } from 'src/app/config/config';
import { AuthService } from 'src/app/shared/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class StaffService {

  constructor(
    public http: HttpClient,
    public authService:AuthService
  ) { }

  listUsers(){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
    const URL = url_servicios+'/staffs';
    return this.http.get(URL, {headers:headers});
  }
  listConfig(){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
    const URL = url_servicios+'/staff/config';
    return this.http.get(URL, {headers:headers});
  }
  getUser(user_id:any){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
    const URL = url_servicios+'/staff/show/'+user_id;
    return this.http.get(URL, {headers:headers});
  }
  createUser(data){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
    const URL = url_servicios+'/staff/store';
    return this.http.post(URL,data, {headers:headers});
  }
  editUser( data:any, user_id:any,){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
    const URL = url_servicios+'/staff/update/'+user_id;
    return this.http.post(URL,data,{headers:headers});
  }
  deleteUser(user_id:any){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
    const URL = url_servicios+'/staff/destroy/'+user_id;
    return this.http.delete(URL, {headers:headers});
  }
}
