import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

const BackendApi = environment.backend_node;

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private _router: Router) {
  }

    
    
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
    if (!req.url.startsWith('http')) {
      return next.handle(req);
    }

    let headers = new HttpHeaders();
    let params = req.params;
    
    // 🔥 EL BLINDAJE REAL: Comparamos directamente contra tu variable de entorno del Backend de Node
    const esPeticionNodeAlertas = req.url.startsWith(BackendApi);

    if (localStorage.getItem('token')) {
      if (esPeticionNodeAlertas) {
        // Formato exclusivo para Node.js
        headers = headers.append('Accept', 'application/json')
                         .append('x-token', localStorage.getItem('token') || '');
      } else {
        // Formato exclusivo para Laravel
        headers = headers.append('Accept', 'application/json')
                         .append('Authorization', 'Bearer ' + localStorage.getItem('token'));
      }
    } else {
      headers = headers.append('Accept', 'application/json');
    }

    return next.handle(req.clone({ headers, params })).pipe(
      catchError(error => {
        // SÓLO expulsamos si el error viene de Laravel. Si viene de Node, dejamos que la app continúe quieta.
        if ((error.status === 401 || error.status === 423) && !esPeticionNodeAlertas) {
          localStorage.clear();
          this._router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
  }

