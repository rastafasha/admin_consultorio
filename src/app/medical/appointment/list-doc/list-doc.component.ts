import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { routes } from 'src/app/shared/routes/routes';
import { AppointmentService } from '../service/appointment.service';
import { FileSaverService } from 'ngx-filesaver';
import * as XLSX from 'xlsx';
import jspdf from 'jspdf';
import { DoctorService } from '../../doctors/service/doctor.service';
import { RolesService } from '../../roles/service/roles.service';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

declare var $:any;
@Component({
  selector: 'app-list-doc',
  templateUrl: './list-doc.component.html',
  styleUrls: ['./list-doc.component.scss']
})
export class ListDocComponent {
  public routes = routes;
  titlePage = 'Mis Citas';

  public appointmentList: any = [];
  dataSource!: MatTableDataSource<any>;

  public showFilter = false;
  public searchDataValue = '';
  public searchDataPatient = '';
  public lastIndex = 0;
  public pageSize = 10;
  public totalDataPatient = 0;
  public skip = 0;
  public limit: number = this.pageSize;
  public pageIndex = 0;
  public serialNumberArray: Array<number> = [];
  public currentPage = 1;
  public pageNumberArray: Array<number> = [];
  public pageSelection: Array<any> = [];
  public totalPages = 0;

  public appointment_generals:any = [];
  public appointment_id:any;
  public appointment:any;
  public appointment_selected:any;
  public text_validation:any;
  public speciality_id= 0;
  public date = null;
  specialities:any = [];
  hours:any;

  confimation:any= null;
  public user:any;
  public doctor_id:any;

  constructor(
    public appointmentService: AppointmentService,
    public doctorService: DoctorService,
    private fileSaver: FileSaverService,
    private ativatedRoute: ActivatedRoute,
    public roleService: RolesService,
    ){

  }
  ngOnInit() {
    window.scrollTo(0, 0);
    this.doctorService.closeMenuSidebar();
    
    this.getSpecialities();
    const USER = localStorage.getItem("user");
    this.user = JSON.parse(USER ? USER: '');
    // this.doctor_id = this.user.id;
    this.user = this.roleService.authService.user;

    this.ativatedRoute.params.subscribe((resp:any)=>{
      this.doctor_id = resp.doctor_id;
      console.log(this.doctor_id);
    });

    this.getTableData();
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
    this.appointmentService.listConfig().subscribe((resp:any)=>{
      this.specialities = resp.specialities;
    })
  }


  

  private getTableData(page=1): void {
    this.appointmentList = [];
    this.serialNumberArray = [];

    this.appointmentService.listAppointmentDocts(this.doctor_id, page, 
      this.searchDataValue, this.searchDataPatient,  this.date).subscribe((resp:any)=>{
      // console.log(resp);

      this.totalDataPatient = resp.total;
      this.appointmentList = resp.appointments.data;
      this.appointment_id = resp.appointments.id;
      console.log(this.appointmentList);
      // this.getTableDataGeneral();
      this.dataSource = new MatTableDataSource<any>(this.appointmentList);
      this.calculateTotalPages(this.totalDataPatient, this.pageSize);
    })
  }

  getTableDataGeneral(){
    this.appointmentList = [];
    this.serialNumberArray = [];
    
    this.appointment_generals.map((res: any, index: number) => {
      const serialNumber = index + 1;
      if (index >= this.skip && serialNumber <= this.limit) {
       
        this.appointmentList.push(res);
        this.serialNumberArray.push(serialNumber);
      }
    });
    this.dataSource = new MatTableDataSource<any>(this.appointmentList);
    this.calculateTotalPages(this.totalDataPatient, this.pageSize);
  }
  selectUser(staff:any){
    this.appointment_selected = staff;
  }

  deletePatient(){
    this.appointmentService.deleteAppointment(this.appointment_selected.id).subscribe((resp:any)=>{
      // console.log(resp);

      if(resp.message == 403){
        this.text_validation = resp.message_text;
      }else{

        const INDEX = this.appointmentList.findIndex((item:any)=> item.id == this.appointment_selected.id);
      if(INDEX !=-1){
        this.appointmentList.splice(INDEX,1);

        $('#delete_patient').hide();
        $("#delete_patient").removeClass("show");
        $(".modal-backdrop").remove();
        $("body").removeClass();
        $("body").removeAttr("style");
        this.appointment_selected = null;
        this.getTableData();
      }
      }
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public searchData() {
    // this.dataSource.filter = value.trim().toLowerCase();
    // this.patientList = this.dataSource.filteredData;
    this.pageSelection = [];
    this.limit = this.pageSize;
    this.skip = 0;
    this.currentPage = 1;
    this.getTableData();
  }

  public sortData(sort: any) {
    const data = this.appointmentList.slice();

    if (!sort.active || sort.direction === '') {
      this.appointmentList = data;
    } else {
      this.appointmentList = data.sort((a, b) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const aValue = (a as any)[sort.active];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const bValue = (b as any)[sort.active];
        return (aValue < bValue ? -1 : 1) * (sort.direction === 'asc' ? 1 : -1);
      });
    }
  }

  public getMoreData(event: string): void {
    if (event == 'next') {
      this.currentPage++;
      this.pageIndex = this.currentPage - 1;
      this.limit += this.pageSize;
      this.skip = this.pageSize * this.pageIndex;
      this.getTableData(this.currentPage);
    } else if (event == 'previous') {
      this.currentPage--;
      this.pageIndex = this.currentPage - 1;
      this.limit -= this.pageSize;
      this.skip = this.pageSize * this.pageIndex;
      this.getTableData(this.currentPage);
    }
  }

  public moveToPage(pageNumber: number): void {
    this.currentPage = pageNumber;
    this.skip = this.pageSelection[pageNumber - 1].skip;
    this.limit = this.pageSelection[pageNumber - 1].limit;
    if (pageNumber > this.currentPage) {
      this.pageIndex = pageNumber - 1;
    } else if (pageNumber < this.currentPage) {
      this.pageIndex = pageNumber + 1;
    }
    this.getTableData(this.currentPage);
  }

  public PageSize(): void {
    this.pageSelection = [];
    this.limit = this.pageSize;
    this.skip = 0;
    this.currentPage = 1;
    this.searchDataValue = '';
    this.searchDataPatient = '';
    this.date= null;
    this.getTableData();
  }

  private calculateTotalPages(totalDataPatient: number, pageSize: number): void {
    this.pageNumberArray = [];
    this.totalPages = totalDataPatient / pageSize;
    if (this.totalPages % 1 != 0) {
      this.totalPages = Math.trunc(this.totalPages + 1);
    }
    /* eslint no-var: off */
    for (var i = 1; i <= this.totalPages; i++) {
      const limit = pageSize * i;
      const skip = limit - pageSize;
      this.pageNumberArray.push(i);
      this.pageSelection.push({ skip: skip, limit: limit });
    }
  }


  excelExport(){
    const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=UTF-8';
    const EXCLE_EXTENSION = '.xlsx';

    this.getTableDataGeneral();
    //custom code
    const worksheet = XLSX.utils.json_to_sheet(this.appointmentList);

    const workbook = {
      Sheets:{
        'testingSheet': worksheet
      },
      SheetNames:['testingSheet']
    }

    const excelBuffer = XLSX.write(workbook, {bookType:'xlsx', type: 'array'});

    const blobData = new Blob([excelBuffer],{type: EXCEL_TYPE});

    this.fileSaver.save(blobData, "pacientes_db_health_connectme_consult",)

  }
  csvExport(){
    const CSV_TYPE = 'text/csv';
    const CSV_EXTENSION = '.csv';

    this.getTableDataGeneral();

    //custom code
    const worksheet = XLSX.utils.json_to_sheet(this.appointmentList);

    const workbook = {
      Sheets:{
        'testingSheet': worksheet
      },
      SheetNames:['testingSheet']
    }

    const excelBuffer = XLSX.write(workbook, {bookType:'csv', type: 'array'});

    const blobData = new Blob([excelBuffer],{type: CSV_TYPE});

    this.fileSaver.save(blobData, "pacientes_db_health_connectme_consult_csv", CSV_EXTENSION)

  }
  txtExport(){
    const TXT_TYPE = 'text/txt';
    const TXT_EXTENSION = '.txt';

    this.getTableDataGeneral();


    //custom code
    const worksheet = XLSX.utils.json_to_sheet(this.appointmentList);

    const workbook = {
      Sheets:{
        'testingSheet': worksheet
      },
      SheetNames:['testingSheet']
    }

    const excelBuffer = XLSX.write(workbook, {bookType:'xlsx', type: 'array'});

    const blobData = new Blob([excelBuffer],{type: TXT_TYPE});

    this.fileSaver.save(blobData, "pacientes_db_health_connectme_consult", TXT_EXTENSION)

  }

  // eslint-disable-next-line no-debugger
  cambiarStatus(data:any){debugger
    const VALUE = data.confimation;
    console.log(VALUE);
    
    this.appointmentService.updateConfirmation(data, data.id).subscribe(
      resp =>{
        console.log(resp);
        Swal.fire('Actualizado', `actualizado correctamente`, 'success');
        // this.toaster.open({
        //   text:'Producto Actualizado!',
        //   caption:'Mensaje de Validación',
        //   type:'success',
        // })
        this.getTableData();
      }
    )
  }

}
