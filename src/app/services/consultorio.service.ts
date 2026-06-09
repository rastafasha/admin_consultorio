import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../shared/auth/auth.service';
const BackendApi = environment.backend_node;

@Injectable({
  providedIn: 'root'
})
export class ConsultorioService {

  constructor(
    private http: HttpClient,
    public authService:AuthService
  ) {}

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

  // 🚀 Solicita a Node que levante Puppeteer y empiece a generar el QR
  
 
 conectarWhatsApp(doctorId: string) {
  const url = `${BackendApi}/klyntic/consultorios/whatsapp/conectar/${doctorId}`;
  
  // 1er parámetro: url
  // 2do parámetro: body (enviamos un objeto vacío {})
  // 3er parámetro: el objeto de configuración que retorna tu 'get headers()'
  return this.http.post(url, {}, this.headers);
}

  // 🔍 El Polling que consultará el estado del QR cada 3 segundos
  

  obtenerEstadoWhatsApp(doctorId:string): Observable<any> {
      const URL = BackendApi+'/klyntic/consultorios/whatsapp-status/'+doctorId;
      return this.http.get(URL, this.headers);
    }
}
