import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ClinicaService } from './clinica.service';
import { AuthService } from './auth.service';
@Injectable({
  providedIn: 'root'
})
export class SettignService {
  // 🚀 SANEADO: Inyección moderna de dependencias (Evitamos constructores redundantes)
  private http = inject(HttpClient);
  public authService = inject(AuthService);

  // 🔒 Constante Maestra: Unificamos todas las llamadas usando la variable del build de Vercel/MAMP
  private readonly baseUrl = environment.url_servicios;
  get token():string{
      return localStorage.getItem('token') || '';
    }
  
  
    get headers(){
      return{
        headers: {
          'x-token': this.token
        }
      }
    }

  
  /* =====================================================================
     🏢 SECCIÓN A: CONFIGURACIÓN GENERAL DEL ESTABLECIMIENTO (SETTINGS)
     ===================================================================== */

  getAllSettings(): Observable<any> {
    const headers = new HttpHeaders({'Authorization': 'Bearer ' +this.authService.token});
    return this.http.get(`${this.baseUrl}/setting`, { headers });
  }

  getSettingByClinicaId(clinica_id: any): Observable<any> {

    const headers = new HttpHeaders({'Authorization': 'Bearer ' +this.authService.token});
    return this.http.get(`${this.baseUrl}/setting/show/${clinica_id}`, { headers });
  }

  createSetting(data: any): Observable<any> {

    const headers = new HttpHeaders({'Authorization': 'Bearer ' +this.authService.token});
    return this.http.post(`${this.baseUrl}/setting/store`, data, { headers });
  }

  updateSetting(data: any, setting_id: any): Observable<any> {

    const headers = new HttpHeaders({'Authorization': 'Bearer ' +this.authService.token});
    return this.http.post(`${this.baseUrl}/setting/update/${setting_id}`, data, { headers });
  }

  deleteSetting(setting_id: any): Observable<any> {

    const headers = new HttpHeaders({'Authorization': 'Bearer ' +this.authService.token});
    return this.http.delete(`${this.baseUrl}/setting/destroy/${setting_id}`, { headers });
  }

  /* =====================================================================
     💳 SECCIÓN B: MÉTODOS DE PAGO ADMITIDOS (PAYMENT METHODS)
     ===================================================================== */

  getAllPaymentMethods(): Observable<any> {

    const headers = new HttpHeaders({'Authorization': 'Bearer ' +this.authService.token});
    return this.http.get(`${this.baseUrl}/paymentmethods`, { headers });
  }

  getPagoById(id: number): Observable<any> {

    const headers = new HttpHeaders({'Authorization': 'Bearer ' +this.authService.token});
    return this.http.get(`${this.baseUrl}/paymentmethods/show/${id}`, { headers });
  }

  getPagoByDoctor(doctor_id: number): Observable<any> {

    const headers = new HttpHeaders({'Authorization': 'Bearer ' +this.authService.token});
    return this.http.get(`${this.baseUrl}/paymentmethods/bydoctor/${doctor_id}`, { headers });
  }

  getActivoPagoByDoctor(doctor_id: number): Observable<any> {

    const headers = new HttpHeaders({'Authorization': 'Bearer ' +this.authService.token});
    return this.http.get(`${this.baseUrl}/paymentmethods/bydoctor-activo/${doctor_id}`, { headers });
  }

  getPaymentMethodsActivas(): Observable<any> {

    const headers = new HttpHeaders({'Authorization': 'Bearer ' +this.authService.token});
    return this.http.get(`${this.baseUrl}/paymentmethods/activos`, { headers });
  }

  createPaymentMethod(data: any): Observable<any> {

    const headers = new HttpHeaders({'Authorization': 'Bearer ' +this.authService.token});
    return this.http.post(`${this.baseUrl}/paymentmethods/store`, data, { headers });
  }

  updatePaymentMethod(data: any, tipodepago_id: any): Observable<any> {

    const headers = new HttpHeaders({'Authorization': 'Bearer ' +this.authService.token});
    return this.http.put(`${this.baseUrl}/paymentmethods/update/${tipodepago_id}`, data, { headers });
  }

  updateStatusPaymentMethod(data: any, tipodepago_id: any): Observable<any> {

    const headers = new HttpHeaders({'Authorization': 'Bearer ' +this.authService.token});
    return this.http.put(`${this.baseUrl}/paymentmethods/update/status/${tipodepago_id}`, data, { headers });
  }

  deletePaymentMethod(id: any): Observable<any> {

    const headers = new HttpHeaders({'Authorization': 'Bearer ' +this.authService.token});
    return this.http.delete(`${this.baseUrl}/paymentmethods/destroy/${id}`, { headers });
  }

  findByReference(title: string): Observable<any> {

    const headers = new HttpHeaders({'Authorization': 'Bearer ' +this.authService.token});
    return this.http.get(`${this.baseUrl}/paymentmethods?title=${title}`, { headers });
  }

  searchPaymentMethods(query = ''): Observable<any> {

    const headers = new HttpHeaders({'Authorization': 'Bearer ' +this.authService.token});
    const params = new HttpParams().set('buscar', query);
    return this.http.get(`${this.baseUrl}/paymentmethods/search`, { headers, params });
  }
}