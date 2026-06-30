import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { url_servicios } from '../config/config';
import { AuthService } from '../shared/auth/auth.service';
import { Observable } from 'rxjs';
import { DoctorAddress } from '../models/DoctorAddress.model';
declare let $:any;

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user:any = JSON.parse(localStorage.getItem('user') || '{}');
  constructor(
    public http: HttpClient,
    public authService: AuthService,

  ) { }

  

  listDoctors(){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    const URL = url_servicios+"/doctors";
    return this.http.get(URL, {headers:headers});
  }
  listConfig(){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token})
    const URL = url_servicios+'/doctors/config';
    return this.http.get(URL, {headers:headers});
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  storeDoctor(data:any){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    const URL = url_servicios+"/doctors/store";
    return this.http.post(URL,data, {headers:headers});
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  showDoctor(doctor_id:number){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    const URL = url_servicios+"/doctors/show/"+doctor_id;
    return this.http.get(URL,{headers:headers});
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editDoctor(data:any, doctor_id:number){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    const URL = url_servicios+"/doctors/update/"+doctor_id;
    return this.http.post(URL,data,{headers:headers});
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  showDoctorProfile(doctor_id:number){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    const URL = url_servicios+"/doctors/profile/"+doctor_id;
    return this.http.get(URL,{headers:headers});
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editDoctorProfile(data:any, doctor_id:number){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    const URL = url_servicios+"/staffs/update/"+doctor_id;
    return this.http.post(URL,data,{headers:headers});
  }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
  yo(user:any){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    // let headers = this.headers;
    const URL = url_servicios+'/me';
    return this.http.post(URL,user, {headers: headers})
  }
  
  
  deleteDoctor(doctor_id:number){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    const URL = url_servicios+"/doctors/destroy/"+doctor_id;
    return this.http.delete(URL, {headers:headers});
  }

  closeMenuSidebar(){
    $('.sidebar').addClass("cerrar");
    $('.menu-opened').remove("menu-opened");
  }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateStatus(data:any, doctor_id:number){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    const URL = url_servicios+"/doctors/update/status/"+doctor_id;
    return this.http.put(URL,data,{headers:headers});
  }

  isPermission(permission:string){
    if(this.user.roles.includes('SUPERADMIN')){
      return true;
    }
    if(this.user.permissions.includes(permission)){
      return true;
    }
    return false;
  }


  // 🏥 ========================================================
  // MÉTODOS ADICIONALES PARA GESTIÓN DE CONSULTORIOS INDEPENDIENTES
  // ========================================================

  // 1. Obtener la lista de consultorios de un médico específico
  getAddressesByDoctor(doctorId: number): Observable<any> {
    const url = `${url_servicios}/doctor-addresses/doctor/${doctorId}`;
    return this.http.get<any>(url);
  }

  // 2. Guardar un consultorio suelto (Por si quieres un botón rápido de "Guardar Sede")
  storeDoctorAddress(data: DoctorAddress): Observable<any> {
    const url = `${url_servicios}/doctor-addresses/store`;
    return this.http.post<any>(url, data);
  }

  // 3. Actualizar un consultorio de forma aislada
  updateDoctorAddress(addressId: number, data: Partial<DoctorAddress>): Observable<any> {
    const url = `${url_servicios}/doctor-addresses/update/${addressId}`;
    return this.http.put<any>(url, data);
  }

  // 4. Eliminar físicamente o dar de baja lógica a un consultorio
  deleteDoctorAddress(addressId: number): Observable<any> {
    const url = `${url_servicios}/doctor-addresses/destroy/${addressId}`;
    return this.http.delete<any>(url);
  }
}
