import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
const BackendApi = environment.backend_node;

@Injectable({
  providedIn: 'root'
})
export class ConsultorioService {

  constructor(private http: HttpClient) {}

  // 🚀 Solicita a Node que levante Puppeteer y empiece a generar el QR
  conectarWhatsApp(doctorId: string): Observable<any> {
    return this.http.post(`${BackendApi}/klyntic/consultorios/whatsapp/conectar/${doctorId}`, {});
  }

  // 🔍 El Polling que consultará el estado del QR cada 3 segundos
  obtenerEstadoWhatsApp(doctorId: string): Observable<any> {
    return this.http.get(`${BackendApi}/klyntic/consultorios/whatsapp-status/${doctorId}`);
  }
}
