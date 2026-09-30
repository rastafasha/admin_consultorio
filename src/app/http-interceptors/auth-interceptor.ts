import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

const BackendApi = environment.backend_node;

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private _router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
    if (!req.url.startsWith('http')) {
      return next.handle(req);
    }

    let headers = new HttpHeaders();
    let params = req.params;
    
    // 🔥 EL BLINDAJE REAL: Comparamos directamente contra tu variable de entorno del Backend de Node [12]
    const esPeticionNodeAlertas = req.url.startsWith(BackendApi);

    // 📦 Recuperamos metadatos de sesión locales de Klyntic
    const token = localStorage.getItem('token');
    const tenantSlug = localStorage.getItem('tenant_slug') || ''; // El slug activo de tu clínica
    const userData = localStorage.getItem('user');

    // 🟢 Cabecera Base universal
    headers = headers.append('Accept', 'application/json');

    if (token) {
      if (esPeticionNodeAlertas) {
        // =========================================================================
        // 🔔 FORMATO EXCLUSIVO PARA NODE.JS (Alertas, Push y WebSockets) [12]
        // =========================================================================
        headers = headers.append('x-token', token);

        // 🚀 SINCRONIZACIÓN PUSH: Inyectamos el ID numérico real de MySQL en el Header
        // Esto evita que guardarSuscripcion guarde 'GUEST_USER' en MongoDB [10]
        if (userData) {
          const user = JSON.parse(userData);
          if (user && user.id) {
            headers = headers.append('x-uid', user.id.toString());
          }
        }

      } else {
        // =========================================================================
        // 🦁 FORMATO EXCLUSIVO PARA LARAVEL (Base de Datos Centralizada) [12]
        // =========================================================================
        headers = headers.append('Authorization', 'Bearer ' + token);
      }

      // =========================================================================
      // 🏢 COMPONENTE MULTI-TENANT GLOBAL: Viaja a ambos mundos por seguridad
      // =========================================================================
      if (tenantSlug) {
        // Saneamos ambos headers para darle soporte tanto al backend viejo como al nuevo
        headers = headers.append('X-Tenant-Slug', tenantSlug)
                         .append('X-Clinica-Slug', tenantSlug);
      }
    }

    return next.handle(req.clone({ headers, params })).pipe(
      catchError(error => {
        // SÓLO expulsamos si el error viene de Laravel. Si viene de Node, dejamos que la app continúe quieta. [12]
        if ((error.status === 401 || error.status === 423) && !esPeticionNodeAlertas) {
          localStorage.clear();
          this._router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}
