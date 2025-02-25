import { Component, ViewChild } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexPlotOptions,
  ApexResponsive,
  ApexXAxis,
  ApexLegend,
  ApexFill,
  ApexGrid,
  ApexStroke,
  ApexTitleSubtitle,
  ApexMarkers,
  ApexYAxis,
  
} from 'ng-apexcharts';
import { Sort } from '@angular/material/sort';
import { DataService } from 'src/app/shared/data/data.service';
import { recentPatients, upcomingAppointments } from 'src/app/shared/models/models';
import { DashboardService } from '../service/dashboard.service';
import { DoctorService } from 'src/app/medical/doctors/service/doctor.service';
import { AppointmentService } from 'src/app/medical/appointment/service/appointment.service';
export type ChartOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  series: ApexAxisChartSeries | any;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chart: ApexChart | any;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dataLabels: ApexDataLabels | any;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plotOptions: ApexPlotOptions | any;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  responsive: ApexResponsive[] | any;
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  xaxis: ApexXAxis | any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  legend: ApexLegend | any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fill: ApexFill | any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  colors: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  grid: ApexGrid | any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stroke: ApexStroke | any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  labels: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  title: ApexTitleSubtitle | any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  markers: ApexMarkers | any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  yaxis: ApexYAxis | any;
};
interface data {
  value: string ;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent {
  public routes = routes;
  public selectedValue ='2024';
  @ViewChild('chart') chart!: ChartComponent;
  public chartOptionsOne: Partial<ChartOptions>;
  public chartOptionsTwo: Partial<ChartOptions>;
  public chartOptionsThree: Partial<ChartOptions>;

  public recentPatients: Array<recentPatients> = [];
  public upcomingAppointments: Array<upcomingAppointments> = [];
 
  //datos reales
  public appointments:any = [];
  public appointment_pendings:any = [];

  public num_appointments_current = 0;
  public num_appointments_before = 0;
  public porcentaje_d = 0;

  public num_patients_current = 0;
  public num_patients_before = 0;
  public porcentaje_dp = 0;

  public num_appointments_attention_current = 0;
  public num_appointments_attention_before = 0;
  public porcentaje_da = 0;

  public num_appointments_total_current = 0;
  public num_appointments_total_before = 0;
  public porcentaje_dt = 0;

  public query_patient_by_genders:any = [];
  public query_patients_specialities:any = [];
  public query_patients_speciality_porcentaje:any = [];
  public query_income_year:any = [];
  public user: any;
  //datos reales

  constructor(
    public data : DataService,
    public dashboardService : DashboardService,
    public doctorService : DoctorService,
    public appointmentService : AppointmentService,
    
    ) {
      this.chartOptionsOne = {
        chart: {
          height: 230,
          type: 'bar',
          stacked: true,
          toolbar: {
            show: false,
          },
        
        },
        grid: {
          show: true, 
          xaxis: {
            lines: {
              show: false
             }
           },  
          yaxis: {
            lines: { 
              show: true 
             }
           },   
          },
        responsive: [
          {
            breakpoint: 480,
            options: {
              legend: {
                position: 'bottom',
                offsetX: -10,
                offsetY: 0,
              },
            },
          },
        ],
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '15%',
          },
        },
        dataLabels: {
          enabled: false,
        },
        series: [
          {
            name: 'Male',
            color: '#513081',
            data: [] //[20, 30, 41, 67, 22, 43, 40, 10, 30, 20, 40],
          },
          {
            name: 'Female',
            color: '#00D3C7',
            data: [] //[13, 23, 20, 8, 13, 27, 30, 25, 10, 15, 20],
          },
        ],
        xaxis: {
          categories: [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
          ],
            axisBorder: {
              show: false, // set to false to hide the vertical gridlines
            },
          },
      };
      this.chartOptionsTwo = {
        series: [],
        labels:[],
        chart: {
          type: 'donut',
          height: 200,
          width: 200,
          toolbar: {
            show: false,
          },
        },
        legend: {
          show: false
        },
        plotOptions: {
          bar: {
              horizontal: false,
              columnWidth: '50%'
          },
      },
        dataLabels: {
          enabled: false,
        },
        responsive: [{
          breakpoint: 480,
          options: {
              chart: {
                  width: 200
              },
              legend: {
                show: false
              }
          }
      }],
      };
      this.chartOptionsThree = {
        chart: {
          height: 200,
          type: 'line',
          toolbar: {
            show: false,
          },
        },
        grid: {
          show: true, 
          xaxis: {
            lines: {
              show: false
             }
           },  
          yaxis: {
            lines: { 
              show: true 
             }
           },   
          },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: 'smooth',
        },
        series: [
          {
            name: 'Income',
            color: '#513081',
            data:[] //[45, 60, 75, 51, 42, 42, 30],
          },
        ],
        xaxis: {
          categories: []//['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        },
      };
      this.recentPatients = this.data.recentPatients;
      this.upcomingAppointments = this.data.upcomingAppointments;
  
  }

  ngOnInit(){
    this.doctorService.closeMenuSidebar();
    window.scrollTo(0, 0);
    this.getDashboardAdmin();
    this.getDashboardAdminYear();
    // this.getAppointmentPending();
    const USER = localStorage.getItem("user");
    this.user = JSON.parse(USER ? USER: '');
  }

  getAppointmentPending(){
    this.appointmentService.pendings().subscribe((resp:any)=>{
      // console.log(resp);
      this.appointment_pendings = resp.appointments.data;
    })
  }

  getDashboardAdmin(){
    this.dashboardService.dashboardAdmin({}).subscribe((resp:any)=>{
      // console.log(resp);

      this.appointments = resp.appointments.data;

      this.num_appointments_current = resp.num_appointments_current;
      this.num_appointments_before = resp.num_appointments_before;
      this.porcentaje_d = resp.porcentaje_d;

      this.num_patients_current = resp.num_patients_current;
      this.num_patients_before = resp.num_patients_before;
      this.porcentaje_dp = resp.porcentaje_dp;

      this.num_appointments_attention_current = resp.num_appointments_attention_current;
      this.num_appointments_attention_before = resp.num_appointments_attention_before;
      this.porcentaje_da = resp.porcentaje_da;

      this.num_appointments_total_current = resp.num_appointments_total_current;
      this.num_appointments_total_before = resp.num_appointments_total_before;
      this.porcentaje_dt = resp.porcentaje_dt;
    })
  }

  getDashboardAdminYear(){
    const data ={
      year: this.selectedValue,
    }
    this.query_income_year = null;
    this.dashboardService.dashboardAdminYear(data).subscribe((resp:any)=>{
      // console.log(resp);
      //start
      this.query_patient_by_genders = resp.query_patients_by_gender;
      
      const data_male:any = [];
      const data_female:any = [];
      this.query_patient_by_genders.forEach((item:any) => {
        data_male.push(item.hombre);
        data_female.push(item.mujer);
      });

      const Patient_by_Genders =[
        {
          name: 'Male',
          color: '#513081',
          data: data_male,
        },
        {
          name: 'Female',
          color: '#00D3C7',
          data: data_female,
        },
      ];
      this.chartOptionsOne.series = Patient_by_Genders;
      //end

      //start
      this.query_patients_specialities = resp.query_patients_speciality;

      const labels_sp:any = [];
      const series_sp:any = [];
      this.query_patients_specialities.forEach((patients_speciality:any)=>{
        labels_sp.push(patients_speciality.name)
        series_sp.push(patients_speciality.count)
      })
      this.chartOptionsTwo.labels = labels_sp;
      this.chartOptionsTwo.series = series_sp;
      //end
      //start
      this.query_patients_speciality_porcentaje = resp.query_patients_speciality_porcentaje;
      //end
      //start
      this.query_income_year = resp.query_income_year;
      const data_income:any = [];
      this.query_income_year.forEach((element:any) => {
        data_income.push(element.income);
      });

      this.chartOptionsThree = {
        chart: {
          height: 200,
          type: 'line',
          toolbar: {
            show: false,
          },
        },
        grid: {
          show: true, 
          xaxis: {
            lines: {
              show: false
             }
           },  
          yaxis: {
            lines: { 
              show: true 
             }
           },   
          },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: 'smooth',
        },
        series: [
            {
              name: 'Income',
              color: '#513081',
              data: data_income,
            },
          ],
        xaxis: {
          categories: resp.months_name,
        },
      };
      
      // this.chartOptionsThree.xaxis.categories = resp.months_name
      // this.chartOptionsThree.series = [
      //   {
      //     name: 'Income',
      //     color: '#513081',
      //     data: data_income,
      //   },
      // ]
      //end
    })
  }
  
  public sortData(sort: Sort) {
    const data = this.recentPatients.slice();
    const datas = this.upcomingAppointments.slice();

    if (!sort.active || sort.direction === '') {
      this.recentPatients = data;
      this.upcomingAppointments = datas;

    } else {
      this.recentPatients = data.sort((a, b) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const aValue = (a as any)[sort.active];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const bValue = (b as any)[sort.active];
        return (aValue < bValue ? -1 : 1) * (sort.direction === 'asc' ? 1 : -1);
      });
      this.upcomingAppointments = datas.sort((a, b) => {
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const aValue = (a as any)[sort.active];
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const bValue = (b as any)[sort.active];
        return (aValue < bValue ? -1 : 1) * (sort.direction === 'asc' ? 1 : -1);
      });
    }
  }

  selectedYear(){
    // console.log(this.selectedValue);
    this.getDashboardAdminYear();
  }
  selecedList: data[] = [
    {value: '2024'},
    {value: '2025'},
    {value: '2026'},
    {value: '2027'},
    {value: '2028'},
    {value: '2029'},
    {value: '2030'},
    {value: '2031'},
    {value: '2032'},
    {value: '2033'},
    {value: '2034'},
    {value: '2035'},
    {value: '2036'},
    {value: '2037'},
    {value: '2038'},
    {value: '2039'},
    {value: '2040'},
    
  ];
  
}
