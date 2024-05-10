import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
// import { AccountService } from '../services/account.service';
import { catchError, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private _router: Router) {
  }

    // intercept(req: HttpRequest<any>,
    //           next: HttpHandler): Observable<HttpEvent<any>> {

    //     const token = localStorage.getItem("auth_token");

    //     if (token) {
    //         const cloned = req.clone({
    //             headers: req.headers.set("Authorization",
    //                 "Bearer " + token)
    //         });

    //         return next.handle(cloned);
    //     }
    //     else {
    //         return next.handle(req);
    //     }
    // }
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      let headers = new HttpHeaders();
      let params = req.params;
      if (localStorage.getItem('auth_token')) {
        headers = headers.append('Accept', 'application/json')
          .append('Authorization', 'Bearer ' + localStorage.getItem('auth_token'));
      } else {
        headers = headers.append('Accept', 'application/json');
        // params = params.append('page', '1');
      }

      return next.handle(req.clone({headers, params})).pipe(catchError(error => {
        if (error.status === 401 || error.status === 423) {
          this._router.navigate(['/login']);
        }

        return throwError(error);
      }));
    }

    errors(error: HttpErrorResponse) {
      if (error.status === 4030 || error.status === 4040 || error.status === 4230) {
        this._router.navigate(['/login']);
      }
      return throwError(error);
    }
}

