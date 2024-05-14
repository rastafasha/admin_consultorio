import { Component, ViewChild } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexStroke,
  ApexGrid,
  ApexFill,
  ApexMarkers,
  ApexYAxis,
  ApexResponsive,
  ApexPlotOptions,
  ApexLegend,
  ApexTooltip,
} from 'ng-apexcharts';
import { DashboardService } from '../service/dashboard.service';
import { DoctorService } from 'src/app/medical/doctors/service/doctor.service';
import { ActivatedRoute } from '@angular/router';
import { PatientMService } from 'src/app/medical/patient-m/service/patient-m.service';
interface data {
  value: string ;
}
export type ChartOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  series: ApexAxisChartSeries | any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chart: ApexChart | any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  xaxis: ApexXAxis | any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dataLabels: ApexDataLabels | any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  grid: ApexGrid | any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fill: ApexFill | any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  markers: ApexMarkers | any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  yaxis: ApexYAxis | any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stroke: ApexStroke | any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  title: ApexTitleSubtitle | any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  labels: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  responsive: ApexResponsive[] | any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plotOptions: ApexPlotOptions | any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tooltip: ApexTooltip | any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  legend: ApexLegend | any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
};

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.scss'],
})
export class DoctorDashboardComponent {
  public routes = routes;
  @ViewChild('chart') chart!: ChartComponent;
  public chartOptionsOne: Partial<ChartOptions>;
  public chartOptionsTwo: Partial<ChartOptions>;
  public chartOptionsThree: Partial<ChartOptions>;
  public selectedValue: string = "2024"  ;

  public doctors:any = [];
  public doctor_id:any;


  public appointments:any = []
  public num_appointments_current:number = 0;
  public num_appointments_before:number = 0;
  public porcentaje_d:number = 0;
  public num_appointments_attention_current:number = 0;
  public num_appointments_attention_before:number = 0;
  public porcentaje_da:number = 0;
  public num_appointments_total_pay_current:number = 0;
  public num_appointments_total_pay_before:number = 0;
  public porcentaje_dtp:number = 0;
  public num_appointments_total_pending_current:number = 0;
  public num_appointments_total_pending_before:number = 0;
  public porcentaje_dtpn:number = 0;

  public query_income_year:any = [];
  public query_patient_by_genders:any = [];
  public query_n_appointment_year:any = [];
  public query_n_appointment_year_before:any = [];

  public user:any;

  public appointment_pendings: any =[];
  public doctorPatientList: any =[];

  constructor(
    public dashboardService:DashboardService,
    public doctorService:DoctorService,
    public patientService:PatientMService,
    public activatedRoute:ActivatedRoute,
  ) {
    this.chartOptionsOne = {
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
      series: [],
      xaxis: {
        categories: []//['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      },
    };
    this.chartOptionsTwo = {
      chart: {
        height: 250,
        width: 330,
        type: 'donut',
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '50%',
        },
      },
      dataLabels: {
        enabled: false,
      },

      series: [44, 55],
      labels: ['Male', 'Female'],
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: 'bottom',
            },
          },
        },
      ],
      legend: {
        position: 'bottom',
      },
    };
    this.chartOptionsThree = {
      chart: {
        height: 230,
        type: 'bar',
        stacked: false,
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
          columnWidth: '55%',
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 6,
        colors: ['transparent'],
      },
      series: [
        {
          name: 'Low',
          color: '#D5D7ED',
          data: [20, 30, 41, 67, 22, 43, 40, 10, 30, 20, 40],
        },
        {
          name: 'High',
          color: '#513081',
          data: [13, 23, 20, 8, 13, 27, 30, 25, 10, 15, 20],
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
      },
    };
  }

  ngOnInit(): void {
    this.doctorService.closeMenuSidebar();
    window.scrollTo(0, 0);
    this.getDoctors();

    let USER = localStorage.getItem("user");
    this.user = JSON.parse(USER ? USER: '');
    this.doctor_id = this.user.id;
    console.log(this.doctor_id);

    if(this.user.roles[0]==='DOCTOR'){

      this.dashboardDoctorProfile();
      this.getDoctor();
    }
    // this.activatedRoute.params.subscribe((resp:any)=>{
    //   console.log(resp);
    //   this.doctor_id = resp.id;
    // });
  }


  getDoctor(){
    this.doctor_id = this.user.id
    this.doctorService.showDoctorProfile(this.doctor_id).subscribe((resp:any)=>{
      // console.log(resp);
      this.appointment_pendings= resp.appointment_pendings.data;
      this.appointments= resp.appointments;

  
    })
  }

  


  

  getDoctors(){
    this.dashboardService.getConfigDashboard().subscribe((resp:any)=>{
      // console.log(resp);
      this.doctors = resp.doctors;
    })
  }

  dashboardDoctorProfile(){
    this.doctor_id = this.user.id;
    let data ={
      doctor_id:this.doctor_id
    }
    
    this.dashboardService.dashboardDoctor(data).subscribe((resp:any)=>{
      console.log(resp);

      this.appointments= resp.appointments.data;

      this.num_appointments_current= resp.num_appointments_current;
      this.num_appointments_before= resp.num_appointments_before;
      this.porcentaje_d= resp.porcentaje_d;

      this.num_appointments_attention_current= resp.num_appointments_attention_current;
      this.num_appointments_attention_before= resp.num_appointments_attention_before;
      this.porcentaje_da= resp.porcentaje_da;

      this.num_appointments_total_pay_current= resp.num_appointments_total_pay_current;
      this.num_appointments_total_pay_before= resp.num_appointments_total_pay_before;
      this.porcentaje_dtp= resp.porcentaje_dtp;

      this.num_appointments_total_pending_current= resp.num_appointments_total_pending_current;
      this.num_appointments_total_pending_before= resp.num_appointments_total_pending_before;
      this.porcentaje_dtpn= resp.porcentaje_dtpn;
      this.doctorPatientList= resp.patientsbydoc.data;
    });
  }
  dashboardDoctorProfileYear(){
    this.doctor_id = this.user.id;
    let data ={
      year: this.selectedValue,
      doctor_id:this.doctor_id
    }
    this.query_income_year = null;
    this.query_n_appointment_year= null;
    this.query_n_appointment_year_before= null;
    this.dashboardService.dashboardDoctorYear(data).subscribe((resp:any)=>{
      // console.log(resp);

      //start
      this.query_income_year = resp.query_income_year;
      let data_income:any = [];
      this.query_income_year.forEach((element:any) => {
        data_income.push(element.income);
      });

      this.chartOptionsOne = {
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
      
      // this.chartOptionsOne.xaxis.categories = resp.months_name
      // this.chartOptionsOne.series = [
      //   {
      //     name: 'Income',
      //     color: '#513081',
      //     data: data_income,
      //   },
      // ]
      //end
      
      //start
      this.query_patient_by_genders = resp.query_patients_by_gender;
      let data_by_gender:any = [];

      this.query_patient_by_genders.forEach((item:any) => {
        data_by_gender.push(parseInt(item.hombre));
        data_by_gender.push(parseInt(item.mujer));
      });

      this.chartOptionsTwo.series = data_by_gender;
      //end
      //start
      this.query_n_appointment_year= resp.query_n_appointment_year;
      this.query_n_appointment_year_before= resp.query_n_appointment_year_before;
      
      let n_appointment_year:any =[]
      this.query_n_appointment_year.forEach((item:any)=>{
        n_appointment_year.push(item.count_appointments);
      })
      let n_appointment_year_before:any =[];
      this.query_n_appointment_year_before.forEach((item:any)=>{
        n_appointment_year_before.push(item.count_appointments);
      })
      
      this.chartOptionsThree = {
        chart: {
          height: 230,
          type: 'bar',
          stacked: false,
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
            columnWidth: '55%',
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          show: true,
          width: 6,
          colors: ['transparent'],
        },
        series: [
          {
            name: (parseInt(this.selectedValue))+"",
            color: '#513081',
            data: n_appointment_year,
          },
          {
            name: (parseInt(this.selectedValue) - 1)+"",
            
            color: '#D5D7ED',
            data: n_appointment_year_before,
          },
        ],
        xaxis: {
          categories: resp.months_name,
        },
      };
      //end
    })
  }

  dashboardDoctor(){
    
    let data ={
      doctor_id:this.doctor_id
    }
    this.dashboardService.dashboardDoctor(data).subscribe((resp:any)=>{
      // console.log(resp);

      this.appointments= resp.appointments.data;

      this.num_appointments_current= resp.num_appointments_current;
      this.num_appointments_before= resp.num_appointments_before;
      this.porcentaje_d= resp.porcentaje_d;

      this.num_appointments_attention_current= resp.num_appointments_attention_current;
      this.num_appointments_attention_before= resp.num_appointments_attention_before;
      this.porcentaje_da= resp.porcentaje_da;

      this.num_appointments_total_pay_current= resp.num_appointments_total_pay_current;
      this.num_appointments_total_pay_before= resp.num_appointments_total_pay_before;
      this.porcentaje_dtp= resp.porcentaje_dtp;

      this.num_appointments_total_pending_current= resp.num_appointments_total_pending_current;
      this.num_appointments_total_pending_before= resp.num_appointments_total_pending_before;
      this.porcentaje_dtpn= resp.porcentaje_dtpn;
    })
  }
  dashboardDoctorYear(){
    let data ={
      year: this.selectedValue,
      doctor_id:this.doctor_id
    }
    this.query_income_year = null;
    this.query_n_appointment_year= null;
    this.query_n_appointment_year_before= null;
    this.dashboardService.dashboardDoctorYear(data).subscribe((resp:any)=>{
      // console.log(resp);

      //start
      this.query_income_year = resp.query_income_year;
      let data_income:any = [];
      this.query_income_year.forEach((element:any) => {
        data_income.push(element.income);
      });

      this.chartOptionsOne = {
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
      
      // this.chartOptionsOne.xaxis.categories = resp.months_name
      // this.chartOptionsOne.series = [
      //   {
      //     name: 'Income',
      //     color: '#513081',
      //     data: data_income,
      //   },
      // ]
      //end
      
      //start
      this.query_patient_by_genders = resp.query_patients_by_gender;
      let data_by_gender:any = [];

      this.query_patient_by_genders.forEach((item:any) => {
        data_by_gender.push(parseInt(item.hombre));
        data_by_gender.push(parseInt(item.mujer));
      });

      this.chartOptionsTwo.series = data_by_gender;
      //end
      //start
      this.query_n_appointment_year= resp.query_n_appointment_year;
      this.query_n_appointment_year_before= resp.query_n_appointment_year_before;
      
      let n_appointment_year:any =[]
      this.query_n_appointment_year.forEach((item:any)=>{
        n_appointment_year.push(item.count_appointments);
      })
      let n_appointment_year_before:any =[];
      this.query_n_appointment_year_before.forEach((item:any)=>{
        n_appointment_year_before.push(item.count_appointments);
      })
      
      this.chartOptionsThree = {
        chart: {
          height: 230,
          type: 'bar',
          stacked: false,
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
            columnWidth: '55%',
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          show: true,
          width: 6,
          colors: ['transparent'],
        },
        series: [
          {
            name: (parseInt(this.selectedValue))+"",
            color: '#513081',
            data: n_appointment_year,
          },
          {
            name: (parseInt(this.selectedValue) - 1)+"",
            
            color: '#D5D7ED',
            data: n_appointment_year_before,
          },
        ],
        xaxis: {
          categories: resp.months_name,
        },
      };
      //end
    })
  }

  selectDoctor(){
    this.dashboardDoctor();
    // this.getDoctor();
    // this.dashboardDoctorProfile();
  }
  
  selectedYear(){
    this.dashboardDoctorYear();
    // this.dashboardDoctorProfileYear();
    
  }

  selecedList: data[] = [
    {value: '2022'},
    {value: '2023'},
    {value: '2024'},
    {value: '2025'},
    {value: '2026'},
    {value: '2027'},
    {value: '2028'},
    {value: '2029'},
    {value: '2030'},
    
  ];
  selecedLists: data[] = [
    {value: 'This Week'},
    {value: 'Last Week'},
    {value: 'This Month'},
    {value: 'Last Month'},
  ];
}
