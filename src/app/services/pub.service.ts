import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { url_servicios } from '../config/config';
import { AuthService } from '../shared/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PubService {

  constructor(
    public http: HttpClient,
    public authService:AuthService
  ) { }

  listPubs(){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
    const URL = url_servicios+'/pub';
    return this.http.get(URL, {headers:headers});
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getPub(pub_id:any){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
    const URL = url_servicios+'/pub/show/'+pub_id;
    return this.http.get(URL, {headers:headers});
  }
  createPub(data){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
    const URL = url_servicios+'/pub/store';
    return this.http.post(URL,data, {headers:headers});
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editPub( data:any, pub_id:number,){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
    const URL = url_servicios+'/pub/update/'+pub_id;
    return this.http.post(URL,data,{headers:headers});
  }
  deletePub(pub_id:number){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
    const URL = url_servicios+'/pub/destroy/'+pub_id;
    return this.http.delete(URL, {headers:headers});
  }

  showPub(pub_id:number){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    const URL = url_servicios+"/pub/profile/"+pub_id;
    return this.http.get(URL,{headers:headers});
  }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateStatus(data:any, pub_id:number){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    const URL = url_servicios+"/pub/update/status/"+pub_id;
    return this.http.put(URL,data,{headers:headers});
  }
}
