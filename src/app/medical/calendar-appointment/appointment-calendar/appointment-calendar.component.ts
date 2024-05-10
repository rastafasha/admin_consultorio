import { Component } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import { CalendarAppointmentService } from '../sevice/calendar-appointment.service';
import { AppoitmentPayService } from '../../appointment-pay/service/appoitment-pay.service';
import { DoctorService } from '../../doctors/service/doctor.service';
import { RolesService } from '../../roles/service/roles.service';

@Component({
  selector: 'app-appointment-calendar',
  templateUrl: './appointment-calendar.component.html',
  styleUrls: ['./appointment-calendar.component.scss']
})
export class AppointmentCalendarComponent {
  public routes = routes;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  events: any[] = [];
  public search_doctor = '';
  public search_patient = '';
  public specialities:any = [];
  public speciality_id:number= 0;

  public user:any;

  constructor(
    public calendarAppointmentService: CalendarAppointmentService,
    public appointmentpayService : AppoitmentPayService,
    public doctorService : DoctorService,
    public roleService: RolesService,
    
    ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // this.data.getEvents().subscribe((events: any) => {
    //   this.events = events;
    //   this.options = { ...this.options, ...{ events: events.data } };
    // });
    this.options = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialDate: new Date(),
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      },
      initialView: 'dayGridMonth',
      editable: true,
      selectable: true,
      selectMirror: true,
      dayMaxEvents: true,
      events: [
        { title: 'Meeting', start: new Date() }
      ]
    };
  }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.doctorService.closeMenuSidebar();
    this.getSpecialities();
    this.getCalendar();
    this.user = this.roleService.authService.user;
  }

  isPermission(permission:string){
    if(this.user.roles.includes('SUPERADMIN')){
      return true;
    }
    if(this.user.permissions.includes(permission)){
      return true;
    }
    return false;
  }


  getSpecialities(){
    this.appointmentpayService.listConfig().subscribe((resp:any)=>{
      this.specialities = resp.specialities;
    })
  }
  getCalendar(){
    let data = {
      search_doctor: this.search_doctor,
      search_patient: this.search_patient,
      speciality_id: this.speciality_id,
    }
    this.calendarAppointmentService.calendarAppointment(data).subscribe((resp:any)=>{
      // console.log(resp);
      this.options = { ...this.options, ...{ events: resp.appointments } };
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public searchData() {
    this.getCalendar();
  }

  reload(){
    document.location.reload();
  }
}
