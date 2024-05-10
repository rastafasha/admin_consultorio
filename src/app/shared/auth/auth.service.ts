import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
// import { BehaviorSubject } from 'rxjs';
import { routes } from '../routes/routes';
import { url_servicios } from 'src/app/config/config';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { LoginForm } from 'src/app/authentication/interfaces/login-form.interface';
// import {tap, map, catchError, } from 'rxjs/operators';
import { catchError, map, of } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class AuthService {

  user:any;
  token:any;

  constructor(
    private router: Router,
    public http: HttpClient
    ) {
      this.getLocalStorage();//devuelve el usuario logueado
    }

    // get token():string{
    //   return localStorage.getItem('token') || '';
    // }

    // get headers(){
    //   return{
    //     headers: {
    //       'token': this.token
    //     }
    //   }
    // }

  //   getToken(){
  //     const token = localStorage.getItem('token');
  //     return this.token;
  //  }

    // guardarLocalStorage( auth: any='authenticated', user:any, access_token: any){
    //   // localStorage.setItem('token', JSON.stringify(token));
    //   localStorage.setItem("user", JSON.stringify(user));
    //   localStorage.setItem(auth, 'true');
    //   localStorage.setItem("token", access_token.original.access_token);
  
    //   return true;
    // }
  
  
    getLocalStorage(){
      if(localStorage.getItem('token') && localStorage.getItem('user')){
        let USER = localStorage.getItem('user');
        this.user = JSON.parse(USER ? USER: '');
      }else{
        this.user = null;
      }
   }

   saveLocalStorage(auth:any){
    if(auth && auth.access_token){
      localStorage.setItem("token",auth.access_token.original.access_token);
      localStorage.setItem("user",JSON.stringify(auth.user));
      localStorage.setItem('authenticated', 'true');
      return true;
    }
    return false;
  }

  

   
  login(email:string,password:string) {
    // localStorage.setItem('authenticated', 'true');
    // this.router.navigate([routes.adminDashboard]);
    let URL = url_servicios+"/login";
    return this.http.post(URL,{email: email,password: password}).pipe(
      map((auth:any) => {
        console.log(auth);
        const result = this.saveLocalStorage(auth);
        return result;
      }),
      catchError((error:any) => {
        console.log(error);
        return of(undefined);
      })
    );
  }





// login(email:any, password:any){

//   // return this.http.post<any>(`${this.serverUrl}/login`, {email: email, password: password}, { withCredentials: false })

//   let URL = url_servicios+"/login";
//   return this.http.post(URL, {email:email, password:password})
//   .pipe(
//     tap((resp: any) => {
//       this.guardarLocalStorage(resp.auth, resp.user, resp.access_token);

//     })
//   )

// }


  
 getUserRomoto(data){
  let headers = new HttpHeaders({'Authorization': 'Bearer'+this.token})
  let URL = url_servicios+'/me';
  return this.http.post(URL,data, {headers:headers});
 }
  

 

 logout(){
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('authenticated');
  this.router.navigate([routes.login]);
 }

  
//  logout(){
//   localStorage.removeItem("token");
//   localStorage.removeItem('user');
//   localStorage.removeItem('authenticated')
//     this.logoutserver();
//   this.router.navigate([routes.login]);
//  }

//  logoutserver(){
//   let headers = new HttpHeaders({'Authorization': 'Bearer'+this.token})
//     let URL = url_servicios+'/auth/logout';
//     return this.http.get(URL, {headers:headers});
// }

}
