import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { url_servicios } from 'src/app/config/config';
import { AuthService } from 'src/app/shared/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PubService {

  constructor(
    public http: HttpClient,
    public authService:AuthService
  ) { }

  listPubs(){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
    let URL = url_servicios+'/pub';
    return this.http.get(URL, {headers:headers});
  }
  
  getPub(pub_id:any){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
    let URL = url_servicios+'/pub/show/'+pub_id;
    return this.http.get(URL, {headers:headers});
  }
  createPub(data){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
    let URL = url_servicios+'/pub/store';
    return this.http.post(URL,data, {headers:headers});
  }
  editPub( data:any, pub_id:any,){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
    let URL = url_servicios+'/pub/update/'+pub_id;
    return this.http.post(URL,data,{headers:headers});
  }
  deletePub(pub_id:any){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
    let URL = url_servicios+'/pub/destroy/'+pub_id;
    return this.http.delete(URL, {headers:headers});
  }

  showPub(pub_id:any){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    let URL = url_servicios+"/pub/profile/"+pub_id;
    return this.http.get(URL,{headers:headers});
  }

  updateStatus(data:any, pub_id:any){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    let URL = url_servicios+"/pub/update/status/"+pub_id;
    return this.http.put(URL,data,{headers:headers});
  }
}
