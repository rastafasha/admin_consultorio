import { Injectable } from '@angular/core';
import { url_servicios } from '../config/config';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../shared/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class OdontogramaService {

  constructor(
    public http: HttpClient,
    public authService: AuthService,
  ) { }

  lisFiterByPatient(patient_id: number) {
    // 🔥 CORRECCIÓN: Agregado el espacio obligatorio después de 'Bearer '
    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    const URL = url_servicios + "/odontograma/paciente/" + patient_id;
    return this.http.get(URL, { headers: headers });
  }

  guardarDiente(data: any) {
    // 🔥 CORRECCIÓN: Agregado el espacio obligatorio después de 'Bearer '
    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    const URL = url_servicios + "/odontograma/store"; // Asegúrate de que coincida con tu routes/api.php de Laravel
    return this.http.post(URL, data, { headers: headers });
  }
}
