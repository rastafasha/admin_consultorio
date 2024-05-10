import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { url_servicios } from 'src/app/config/config';
import { AuthService } from 'src/app/shared/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor(
    public http: HttpClient,
    public authService: AuthService,

  ) { }

  

  // getAll(page:number=1, search:string=''){
  //   let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
  //   let URL = url_servicios+'/payment?page='+page+"&search="+search;
  //   return this.http.get(URL, {headers:headers});
  // }


  getAll(page:number=1, 
    search_referencia:string='', 
    // search_patient:string='', 
    // speciality_id:number=0, 
    // date_start:string= '',
    // date_end:string= '',
    ){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    let LINK = "";
    if(search_referencia){
    LINK+="&search_referencia="+search_referencia;
    }
    // if(search_patient){
    // LINK+="&search_patient="+search_patient;
    // }
    // if(speciality_id){
    // LINK+="&speciality_id="+speciality_id;
    // }
    // if(date_start){
    // LINK+="&date_start="+date_start;
    // }
    // if(date_end){
    // LINK+="&date_end="+date_end;
    // }
    let URL = url_servicios+'/payment?page='+page+LINK;
    return this.http.get(URL, {headers:headers});
}

   update(data:any, id:any){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    let URL = url_servicios+"/payment/update/"+id;
    return this.http.put(URL,data,{headers:headers});
  }

   getPagosbyUser(id:number) {
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    let URL = url_servicios+"/payment/pagosbyUser/"+id;
    return this.http.put(URL,{headers:headers});
  }

   getRecientes() {
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
    let URL = url_servicios+'/payment/recientes';
    
  }

  updateStatus(data:any, payment_id:any){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    let URL = url_servicios+"/payment/update/status/"+payment_id;
    return this.http.put(URL,data,{headers:headers});
  }
 
}
