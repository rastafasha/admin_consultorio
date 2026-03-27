import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { routes } from '../routes/routes';
import { url_servicios } from 'src/app/config/config';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from 'src/app/models/user.model';

import { LoginForm } from 'src/app/authentication/interfaces/login-form.interface';
import { catchError, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user: User | null = null;
  token: string | null = null;
  public currentUser$ = new BehaviorSubject<User | null>(null);

  constructor(
    private router: Router,
    public http: HttpClient
  ) {
    this.getLocalStorage();
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
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      this.token = token;
      this.user = JSON.parse(userStr) as User;
      this.currentUser$.next(this.user);
    } else {
      this.user = null;
      this.token = null;
      this.currentUser$.next(null);
    }
  }

  saveLocalStorage(auth: any): boolean {
    if (auth && auth.access_token && auth.user) {
      this.token = auth.access_token.original.access_token;
      localStorage.setItem("token", this.token!);
      this.user = auth.user as User;
      localStorage.setItem("user", JSON.stringify(this.user));
      localStorage.setItem('authenticated', 'true');
      this.currentUser$.next(this.user);
      return true;
    }
    return false;
  }

  

   
  login(email:string,password:string) {
    // localStorage.setItem('authenticated', 'true');
    // this.router.navigate([routes.adminDashboard]);
    const URL = url_servicios+"/login";
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


  
  getUserRomoto(data: any) {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${this.token}` });
    const URL = url_servicios + '/me';
    return this.http.post(URL, data, { headers });
  }
  

 

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('authenticated');
    this.user = null;
    this.token = null;
    this.currentUser$.next(null);
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
