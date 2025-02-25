import { Component, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { routes } from 'src/app/shared/routes/routes';
import { StaffService } from '../service/staff.service';
import { FileSaverService } from 'ngx-filesaver';
import * as XLSX from 'xlsx';
import jspdf from 'jspdf';
import { DoctorService } from '../../doctors/service/doctor.service';
import { RolesService } from '../../roles/service/roles.service';

declare var $:any;  

@Component({
  selector: 'app-list-staff-n',
  templateUrl: './list-staff-n.component.html',
  styleUrls: ['./list-staff-n.component.scss']
})
export class ListStaffNComponent {
  public routes = routes;
  @ViewChild('content') content:ElementRef;
  
  titlePage   = 'Personal';
  public staffList: any = [];
  dataSource!: MatTableDataSource<any>;

  public showFilter = false;
  public searchDataValue = '';
  public lastIndex = 0;
  public pageSize = 10;
  public totalDataStaff = 0;
  public skip = 0;
  public limit: number = this.pageSize;
  public pageIndex = 0;
  public serialNumberArray: Array<number> = [];
  public currentPage = 1;
  public pageNumberArray: Array<number> = [];
  public pageSelection: Array<any> = [];
  public totalPages = 0;

  public staff_generals:any = [];
  public staff_id:any;
  public staff_selected:any;
  public text_validation:any;
  public user:any;
  public roles:any;
 
  public addClass = false;
  constructor(
    public staffService: StaffService,
    public doctorService: DoctorService,
    public roleService: RolesService,
    private fileSaver: FileSaverService
    ){

  }
  ngOnInit() {
    this.doctorService.closeMenuSidebar();
    window.scrollTo(0, 0);
    this.getTableData();
    this.user = this.roleService.authService.user;
    this.roles = this.user.roles[0];
  }
  private getTableData(): void {
    this.staffList = [];
    this.serialNumberArray = [];

    this.staffService.listUsers().subscribe((resp:any)=>{
      
      // console.log(resp);

      this.totalDataStaff = resp.users.data.length;
      this.staff_generals = resp.users.data;
      this.staff_id = resp.users.id;
     this.getTableDataGeneral();
    })

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

  getTableDataGeneral(){
    this.staffList = [];
    this.serialNumberArray = [];
    
    this.staff_generals.map((res: any, index: number) => {
      const serialNumber = index + 1;
      if (index >= this.skip && serialNumber <= this.limit) {
       
        this.staffList.push(res);
        this.serialNumberArray.push(serialNumber);
      }
    });
    this.dataSource = new MatTableDataSource<any>(this.staffList);
    this.calculateTotalPages(this.totalDataStaff, this.pageSize);
  }
  
  selectUser(staff:any){
    this.staff_selected = staff;
  }

  deleteRol(){
    this.staffService.deleteUser(this.staff_selected.id).subscribe((resp:any)=>{
      // console.log(resp);

      if(resp.message == 403){
        this.text_validation = resp.message_text;
      }else{

        const INDEX = this.staffList.findIndex((item:any)=> item.id == this.staff_selected.id);
      if(INDEX !=-1){
        this.staffList.splice(INDEX,1);

          $('#delete_patient').hide();
          $("#delete_patient").removeClass("show");
          $(".modal-backdrop").remove();
          $("body").removeClass();
          $("body").removeAttr("style");
          this.staff_selected = null;
        }
      }
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public searchData(value: any): void {
    this.dataSource.filter = value.trim().toLowerCase();
    this.staffList = this.dataSource.filteredData;
  }

  public sortData(sort: any) {
    const data = this.staffList.slice();

    if (!sort.active || sort.direction === '') {
      this.staffList = data;
    } else {
      this.staffList = data.sort((a, b) => {
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
      this.getTableDataGeneral();
    } else if (event == 'previous') {
      this.currentPage--;
      this.pageIndex = this.currentPage - 1;
      this.limit -= this.pageSize;
      this.skip = this.pageSize * this.pageIndex;
      this.getTableDataGeneral();
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
    this.getTableDataGeneral();
  }

  public PageSize(): void {
    this.pageSelection = [];
    this.limit = this.pageSize;
    this.skip = 0;
    this.currentPage = 1;
    this.getTableDataGeneral();
    this.searchDataValue = '';
  }

  private calculateTotalPages(totalDataStaff: number, pageSize: number): void {
    this.pageNumberArray = [];
    this.totalPages = totalDataStaff / pageSize;
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
    const worksheet = XLSX.utils.json_to_sheet(this.staff_generals);

    const workbook = {
      Sheets:{
        'testingSheet': worksheet
      },
      SheetNames:['testingSheet']
    }

    const excelBuffer = XLSX.write(workbook, {bookType:'xlsx', type: 'array'});

    const blobData = new Blob([excelBuffer],{type: EXCEL_TYPE});

    this.fileSaver.save(blobData, "staffs_db_appcitasmedicas",)

  }
  csvExport(){
    const CSV_TYPE = 'text/csv';
    const CSV_EXTENSION = '.csv';

    this.getTableDataGeneral();

    //custom code
    const worksheet = XLSX.utils.json_to_sheet(this.staff_generals);

    const workbook = {
      Sheets:{
        'testingSheet': worksheet
      },
      SheetNames:['testingSheet']
    }

    const excelBuffer = XLSX.write(workbook, {bookType:'csv', type: 'array'});

    const blobData = new Blob([excelBuffer],{type: CSV_TYPE});

    this.fileSaver.save(blobData, "staffs_db_appcitasmedicas", CSV_EXTENSION)

  }

  txtExport(){
    const TXT_TYPE = 'text/txt';
    const TXT_EXTENSION = '.txt';

    this.getTableDataGeneral();


    //custom code
    const worksheet = XLSX.utils.json_to_sheet(this.staff_generals);

    const workbook = {
      Sheets:{
        'testingSheet': worksheet
      },
      SheetNames:['testingSheet']
    }

    const excelBuffer = XLSX.write(workbook, {bookType:'xlsx', type: 'array'});

    const blobData = new Blob([excelBuffer],{type: TXT_TYPE});

    this.fileSaver.save(blobData, "staffs_db_appcitasmedicas", TXT_EXTENSION)

  }

  pdfExport(){
    // var doc = new jspdf(); 
    
    // const worksheet = XLSX.utils.json_to_sheet(this.staff_generals);

    // const workbook = {
    //   Sheets:{
    //     'testingSheet': worksheet
    //   },
    //   SheetNames:['testingSheet']
    // }

    // doc.html(document.body, {
    //   callback: function (doc) {
    //     doc.save('staffs_db_appcitasmedicas.pdf');
    //   }
    // });

  }

  
  

}
