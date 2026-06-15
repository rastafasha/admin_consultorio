import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Tasabcv } from '../models/tasabcba';

const baseUrl = environment.backend_node;

@Injectable({
  providedIn: 'root'
})
export class TasadollarbcvService {

  public tasadollarbcv!: Tasabcv;

  constructor(private http: HttpClient) { }

  get token(): string {
    return localStorage.getItem('token') || '';
  }


  get headers() {
    return {
      headers: {
        'auth_token': this.token
      }
    }
  }


  getTasas() {
    const url = `${baseUrl}/tasadollarbcv`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, tasas: Tasabcv }) => resp.tasas)
      )
  }
  getUltimaTasa() {
    const url = `${baseUrl}/tasadollarbcv/ultimatasa`;
    return this.http.get<any>(url, this.headers)
      .pipe(
        map((resp: { ok: boolean, tasa: Tasabcv }) => resp.tasa)
      )
  }

  createTasaBcv(tasa: any) {
    const url = `${baseUrl}/tasadollarbcv/crear`;
    return this.http.post(url, tasa, this.headers);
  }


  updateTasaBcv(tasa: Tasabcv, id: number) {
    return this.http.put<any>(baseUrl + '/tasadollarbcv/editar/' + id, tasa, this.headers)
  }

  deleteTasaBcv(tasa: any) {
    const url = `${baseUrl}/tasadollarbcv/borrar/${tasa}`;
    return this.http.delete(url, this.headers);
  }
}
