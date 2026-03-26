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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  calendarAppointment(data:any){
    const headers = new HttpHeaders({'Authorization': 'Bearer'+this.authService.token});
    const URL = url_servicios+"/appointment/calendar";
    return this.http.post(URL,data, {headers:headers});
  }
}
