import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { url_servicios } from 'src/app/config/config';
import { AuthService } from 'src/app/shared/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CalendarAppointmentService {

  constructor(
    public http: HttpClient,
    public authService: AuthService,

  ) { }

  calendarAppointment(data:any){
    let headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    let URL = url_servicios+"/appointment/calendar";
    return this.http.post(URL,data, {headers:headers});
  }
}
