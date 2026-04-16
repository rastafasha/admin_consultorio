import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { routes } from '../routes/routes';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';
import { url_servicios } from '../../config/config';
import { User } from '../../models/user.model';

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


}
