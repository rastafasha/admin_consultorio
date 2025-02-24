import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { FileSaverService } from 'ngx-filesaver';
import { routes } from 'src/app/shared/routes/routes';
import Swal from 'sweetalert2';
import { DoctorService } from '../../doctors/service/doctor.service';
import { RolesService } from '../../roles/service/roles.service';
import * as XLSX from 'xlsx';
import { PresupuestoService } from '../service/presupuesto.service';
declare var $:any;
@Component({
  selector: 'app-presupuesto-doctor-list',
  templateUrl: './presupuesto-doctor-list.component.html',
  styleUrls: ['./presupuesto-doctor-list.component.scss']
})
export class PresupuestoDoctorListComponent {
public routes = routes;
  titlePage = 'Mis Presupuestos';

  public presupuestoList: any = [];
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

  public presupuesto_generals:any = [];
  public presupuesto_id:any;
  public presupuesto:any;
  public presupuesto_selected:any;
  public text_validation:any;
  public speciality_id= 0;
  public date = null;
  specialities:any = [];
  hours:any;

  confimation:any= null;
  public user:any;
  public doctor_id:any;

  constructor(
    public presupuestoService: PresupuestoService,
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

    this.user = this.roleService.authService.user;
    this.doctor_id = this.user.id;

    // this.ativatedRoute.params.subscribe((resp:any)=>{
    //   // this.doctor_id = resp.user;
    // });
      console.log(this.doctor_id);

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
    this.presupuestoService.listConfig().subscribe((resp:any)=>{
      this.specialities = resp.specialities;
    })
  }


  

  private getTableData(page=1): void {
    this.presupuestoList = [];
    this.serialNumberArray = [];

    this.presupuestoService.listAppointmentDocts(this.doctor_id, page, 
      this.searchDataValue, this.searchDataPatient,  this.date).subscribe((resp:any)=>{
      // console.log(resp);

      this.totalDataPatient = resp.total;
      this.presupuestoList = resp.presupuestos.data;
      this.presupuesto_id = resp.presupuestos.id;
      console.log(this.presupuestoList);
      // this.getTableDataGeneral();
      this.dataSource = new MatTableDataSource<any>(this.presupuestoList);
      this.calculateTotalPages(this.totalDataPatient, this.pageSize);
    })
  }

  getTableDataGeneral(){
    this.presupuestoList = [];
    this.serialNumberArray = [];
    
    this.presupuesto_generals.map((res: any, index: number) => {
      const serialNumber = index + 1;
      if (index >= this.skip && serialNumber <= this.limit) {
       
        this.presupuestoList.push(res);
        this.serialNumberArray.push(serialNumber);
      }
    });
    this.dataSource = new MatTableDataSource<any>(this.presupuestoList);
    this.calculateTotalPages(this.totalDataPatient, this.pageSize);
  }
  selectUser(staff:any){
    this.presupuesto_selected = staff;
  }

  deletePatient(){
    this.presupuestoService.deletePresupuesto(this.presupuesto_selected.id).subscribe((resp:any)=>{
      // console.log(resp);

      if(resp.message == 403){
        this.text_validation = resp.message_text;
      }else{

        const INDEX = this.presupuestoList.findIndex((item:any)=> item.id == this.presupuesto_selected.id);
      if(INDEX !=-1){
        this.presupuestoList.splice(INDEX,1);

        $('#delete_patient').hide();
        $("#delete_patient").removeClass("show");
        $(".modal-backdrop").remove();
        $("body").removeClass();
        $("body").removeAttr("style");
        this.presupuesto_selected = null;
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
    const data = this.presupuestoList.slice();

    if (!sort.active || sort.direction === '') {
      this.presupuestoList = data;
    } else {
      this.presupuestoList = data.sort((a, b) => {
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
    const worksheet = XLSX.utils.json_to_sheet(this.presupuestoList);

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
    const worksheet = XLSX.utils.json_to_sheet(this.presupuestoList);

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
    const worksheet = XLSX.utils.json_to_sheet(this.presupuestoList);

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
    
    this.presupuestoService.updateConfirmation(data, data.id).subscribe(
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
