import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { PaymentMethod } from './paymentMethod';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { url_servicios } from 'src/app/config/config';

const baseUrl = environment.url_servicios;

@Injectable({
  providedIn: 'root'
})
export class SettignService {


  constructor(
    public http: HttpClient,
    public authService:AuthService
  ) { }

//payment methods

getAllSettings(){
  let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
  let URL = url_servicios+'/setting';
  return this.http.get(URL, {headers:headers});
  
}

getSettingById(setting_id:any){
  let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
  let URL = url_servicios+'/setting/show/'+setting_id;
  return this.http.get(URL, {headers:headers});
  
}

createSetting(data:any){
  let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
  let URL = url_servicios+'/setting/store';
  return this.http.post(URL,data, {headers:headers});
}

updateSetting(data, setting_id:any, ){
 
  let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
  let URL = url_servicios+'/setting/update/'+setting_id;
  return this.http.post(URL,data,{headers:headers});
}

deleteSetting(setting_id): Observable<any> {
  let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
  let URL = url_servicios+'/setting/destroy/'+setting_id;
  return this.http.delete(URL, {headers:headers});
}

//payment methods



//payment methods

  getAll(){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
    let URL = url_servicios+'/paymentmethods';
    return this.http.get(URL, {headers:headers});
    
  }

  getPagoById(id:number){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
    let URL = url_servicios+'/paymentmethods/show/'+id;
    return this.http.get(URL, {headers:headers});
    
  }
  getPagoByDoctor(doctor_id:number){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
    let URL = url_servicios+'/paymentmethods/bydoctor/'+doctor_id;
    return this.http.get(URL, {headers:headers});
    
  }
  getActivoPagoByDoctor(doctor_id:number){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
    let URL = `${baseUrl}/paymentmethods/bydoctor-activo/`+doctor_id;
    return this.http.get(URL, {headers:headers});
    
  }

  getActivas() {
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
    let URL = url_servicios+'/paymentmethods/activos';
    return this.http.get(URL, {headers:headers});
    
  }

  create(data:any){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
    let URL = url_servicios+'/paymentmethods/store';
    return this.http.post(URL,data, {headers:headers});
  }

  update(data, tiposdepago:any, ){
   
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
    let URL = url_servicios+'/paymentmethods/update/'+tiposdepago;
    return this.http.put(URL,data,{headers:headers});
  }

  updateStatus(data, tipodepago_id:any) {
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
    let URL = url_servicios+'/paymentmethods/update/status/'+tipodepago_id;
    return this.http.put(URL,data,{headers:headers});

  }


  delete(id): Observable<any> {
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
    let URL = url_servicios+'/paymentmethods/destroy/'+id;
    return this.http.delete(URL, {headers:headers});
  }

  findByReference(title): Observable<any> {
    return this.http.get(`${baseUrl}/paymentmethods/?title=${title}`);
  }

 

  search(query=''){
    return this.http.get(`${baseUrl}/paymentmethods/search`, {params: {buscar: query}})

  }
//payment methods



}
