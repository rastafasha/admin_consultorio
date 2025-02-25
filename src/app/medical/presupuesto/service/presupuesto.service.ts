import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { url_servicios } from 'src/app/config/config';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { Presupuesto } from '../presupuesto-model';

@Injectable({
  providedIn: 'root'
})
export class PresupuestoService {

  constructor(
    public http: HttpClient,
    public authService:AuthService
  ) { }

  // listPresupuestos(){
  //   const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
  //   const URL = url_servicios+'/presupuesto';
  //   return this.http.get(URL, {headers:headers});
  // }

  listPresupuestos(page=1, search='', speciality_id=0,date= ''){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    let LINK = "";
    if(search){
      LINK+="&search="+search;
    }
    if(speciality_id){
      LINK+="&speciality_id="+speciality_id;
    }
    if(date){
      LINK+="&date="+date;
    }
    const URL = url_servicios+'/presupuesto?page='+page+LINK;
    return this.http.get(URL, {headers:headers});
  }

  listAppointmentDocts(
    doctor_id:any, 
    page=1, 
    search='', 
    search_patient='',
    date= '',
  ){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    let LINK = "";
    if(search){
      LINK+="&search="+search;
    }
    if(search_patient){
      LINK+="&search_patient="+search_patient;
      }
    
    if(date){
      LINK+="&date="+date;
    }
    
    const URL = url_servicios+'/presupuesto/byDoctor/'+doctor_id+'/?page='+page+LINK;
    return this.http.get(URL, {headers:headers});
  }

  

  listConfig(){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
    const URL = url_servicios+'/presupuesto/config';
    return this.http.get(URL, {headers:headers});
  }
  getPresupuesto(presupuesto_id:number){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
    const URL = url_servicios+'/presupuesto/show/'+presupuesto_id;
    return this.http.get(URL, {headers:headers})
    .pipe(
      map((resp:any)=>{
        return resp;
      })
    );
  }
  createPresupuesto(data){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
    const URL = url_servicios+'/presupuesto/store';
    return this.http.post(URL,data, {headers:headers});
  }
  editPresupuesto( data:any, presupuesto_id:any,){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
    const URL = url_servicios+'/presupuesto/update/'+presupuesto_id;
    return this.http.put(URL,data,{headers:headers});
  }
  deletePresupuesto(presupuesto_id:any){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
    const URL = url_servicios+'/presupuesto/destroy/'+presupuesto_id;
    return this.http.delete(URL, {headers:headers});
  }

  showPresupuesto(presupuesto_id:any){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    const URL = url_servicios+"/presupuesto/profile/"+presupuesto_id;
    return this.http.get(URL,{headers:headers});
  }

  updateStatus(data:any, presupuesto_id:any){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    const URL = url_servicios+"/presupuesto/update/status/"+presupuesto_id;
    return this.http.put(URL,data,{headers:headers});
  }

  updateConfirmation(data:any, presupuesto_id:any){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    const URL = url_servicios+"/presupuesto/update/cofirmation/"+presupuesto_id;
    return this.http.put(URL,data,{headers:headers});
  }

  deletePresupuestoItem(presupuesto_id:any, presupuestoitem_id:number){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
    const URL = url_servicios+'/presupuesto/destroy/item/'+presupuesto_id+'/'+presupuestoitem_id;
    return this.http.delete(URL, {headers:headers});
  }
}
