import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ClinicaService } from './clinica.service';

@Injectable({
  providedIn: 'root'
})
export class SettignService {
  // 🚀 SANEADO: Inyección moderna de dependencias (Evitamos constructores redundantes)
  private http = inject(HttpClient);
  private clinicaService = inject(ClinicaService);

  // 🔒 Constante Maestra: Unificamos todas las llamadas usando la variable del build de Vercel/MAMP
  private readonly baseUrl = environment.url_servicios;

  /**
   * 🛡️ Helper para construir las cabeceras Enterprise con el aislamiento de subdominio actual
   */
  private getHeadersEnterprise(): HttpHeaders {
    const slugActual = this.clinicaService.obtenerSlugDeUrl();
    return new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
      'X-Clinica-Slug': slugActual // Flag indispensable de aislamiento Tenant
    });
  }

  /* =====================================================================
     🏢 SECCIÓN A: CONFIGURACIÓN GENERAL DEL ESTABLECIMIENTO (SETTINGS)
     ===================================================================== */

  getAllSettings(): Observable<any> {
    const headers = this.getHeadersEnterprise();
    return this.http.get(`${this.baseUrl}/setting`, { headers });
  }

  getSettingById(setting_id: any): Observable<any> {
    const headers = this.getHeadersEnterprise();
    return this.http.get(`${this.baseUrl}/setting/show/${setting_id}`, { headers });
  }

  createSetting(data: any): Observable<any> {
    const headers = this.getHeadersEnterprise();
    return this.http.post(`${this.baseUrl}/setting/store`, data, { headers });
  }

  updateSetting(data: any, setting_id: any): Observable<any> {
    const headers = this.getHeadersEnterprise();
    return this.http.post(`${this.baseUrl}/setting/update/${setting_id}`, data, { headers });
  }

  deleteSetting(setting_id: any): Observable<any> {
    const headers = this.getHeadersEnterprise();
    return this.http.delete(`${this.baseUrl}/setting/destroy/${setting_id}`, { headers });
  }

  /* =====================================================================
     💳 SECCIÓN B: MÉTODOS DE PAGO ADMITIDOS (PAYMENT METHODS)
     ===================================================================== */

  getAllPaymentMethods(): Observable<any> {
    const headers = this.getHeadersEnterprise();
    return this.http.get(`${this.baseUrl}/paymentmethods`, { headers });
  }

  getPagoById(id: number): Observable<any> {
    const headers = this.getHeadersEnterprise();
    return this.http.get(`${this.baseUrl}/paymentmethods/show/${id}`, { headers });
  }

  getPagoByDoctor(doctor_id: number): Observable<any> {
    const headers = this.getHeadersEnterprise();
    return this.http.get(`${this.baseUrl}/paymentmethods/bydoctor/${doctor_id}`, { headers });
  }

  getActivoPagoByDoctor(doctor_id: number): Observable<any> {
    const headers = this.getHeadersEnterprise();
    return this.http.get(`${this.baseUrl}/paymentmethods/bydoctor-activo/${doctor_id}`, { headers });
  }

  getPaymentMethodsActivas(): Observable<any> {
    const headers = this.getHeadersEnterprise();
    return this.http.get(`${this.baseUrl}/paymentmethods/activos`, { headers });
  }

  createPaymentMethod(data: any): Observable<any> {
    const headers = this.getHeadersEnterprise();
    return this.http.post(`${this.baseUrl}/paymentmethods/store`, data, { headers });
  }

  updatePaymentMethod(data: any, tipodepago_id: any): Observable<any> {
    const headers = this.getHeadersEnterprise();
    return this.http.put(`${this.baseUrl}/paymentmethods/update/${tipodepago_id}`, data, { headers });
  }

  updateStatusPaymentMethod(data: any, tipodepago_id: any): Observable<any> {
    const headers = this.getHeadersEnterprise();
    return this.http.put(`${this.baseUrl}/paymentmethods/update/status/${tipodepago_id}`, data, { headers });
  }

  deletePaymentMethod(id: any): Observable<any> {
    const headers = this.getHeadersEnterprise();
    return this.http.delete(`${this.baseUrl}/paymentmethods/destroy/${id}`, { headers });
  }

  findByReference(title: string): Observable<any> {
    const headers = this.getHeadersEnterprise();
    return this.http.get(`${this.baseUrl}/paymentmethods?title=${title}`, { headers });
  }

  searchPaymentMethods(query = ''): Observable<any> {
    const headers = this.getHeadersEnterprise();
    const params = new HttpParams().set('buscar', query);
    return this.http.get(`${this.baseUrl}/paymentmethods/search`, { headers, params });
  }
}