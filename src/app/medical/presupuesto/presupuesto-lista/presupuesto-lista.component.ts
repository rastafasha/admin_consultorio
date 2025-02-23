import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FileSaverService } from 'ngx-filesaver';
import { routes } from 'src/app/shared/routes/routes';
import { DoctorService } from '../../doctors/service/doctor.service';
import { LaboratoryService } from '../../laboratory/service/laboratory.service';
import { RolesService } from '../../roles/service/roles.service';
import { PresupuestoService } from '../service/presupuesto.service';
import { SpecialitieService } from '../../specialitie/service/specialitie.service';
import Swal from 'sweetalert2';
declare var $:any;
@Component({
  selector: 'app-presupuesto-lista',
  templateUrl: './presupuesto-lista.component.html',
  styleUrls: ['./presupuesto-lista.component.scss']
})
export class PresupuestoListaComponent {

  public routes = routes;
    titlePage = 'Presupuestos';
  
    public text_success = '';
   
    dataSource!: MatTableDataSource<any>;
  
    public isLoading = false;
    public showFilter = false;
    public searchDataValue = '';
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

    public presupuestoList: any = [];
    public presupuesto_id:any;

    public appointment_generals:any = [];
    public appointment_selected:any;
    public text_validation:any;
    public speciality_id= 0;
    public date = null;

    specialities:any = [];
    public user:any;
    public doctor_id:number;
    roles:any = [];

  DOCTOR_SELECTED:any;


      constructor(
        public presupuestoService: PresupuestoService,
        public doctorService: DoctorService,
        public laboratoryService: LaboratoryService,
        public roleService: RolesService,
        public specialitiService: SpecialitieService,
        ){
    
      }
      ngOnInit() {
        window.scrollTo(0, 0);
        this.doctorService.closeMenuSidebar();
        this.getSpecialities();
        this.user = this.roleService.authService.user;
        this.roles = this.user.roles[0];
        if(this.roles === 'DOCTOR'){
          this.doctor_id = this.user.id;
          this.getDoctor();
          
        }
        this.getTableData();
      }

      getDoctor(){
  

        this.doctorService.showDoctor(this.doctor_id).subscribe((resp:any)=>{
          this.DOCTOR_SELECTED = resp.user;
          console.log(this.DOCTOR_SELECTED);

          this.speciality_id = this.DOCTOR_SELECTED.speciality_id;
          this.specialitiService.showSpeciality(this.speciality_id ).subscribe((resp:any)=>{
            console.log(resp);
          })
      
        })
      }
    
      getSpecialities(){
        this.presupuestoService.listConfig().subscribe((resp:any)=>{
          this.specialities = resp.specialities;
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
    
      // eslint-disable-next-line no-debugger
      private getTableData(page=1): void {
        this.presupuestoList = [];
        this.serialNumberArray = [];
        this.isLoading = true;
        if(this.roles === 'DOCTOR'){
          // this.doctor_id = this.user.id;
          this.getTableDataDoctor();
          
        }
        this.presupuestoService.listPresupuestos(page, this.searchDataValue, this.speciality_id, this.date).subscribe((resp:any)=>{
          // console.log(resp);
          this.isLoading = false;
          this.totalDataPatient = resp.total;
          this.presupuestoList = resp.presupuestos.data;
          this.presupuesto_id = resp.presupuestos.id;
          // this.getTableDataGeneral();
          this.dataSource = new MatTableDataSource<any>(this.presupuestoList);
          this.calculateTotalPages(this.totalDataPatient, this.pageSize);
        })
      }

      private getTableDataDoctor(page=1): void {
    
        this.presupuestoService.listAppointmentDocts(this.doctor_id, page, 
          this.searchDataValue,  this.date).subscribe((resp:any)=>{
          // console.log(resp);
    
          this.totalDataPatient = resp.total;
          this.presupuestoList = resp.presupuestos.data;
          this.presupuestoList = resp.presupuestos.id;
          console.log(this.presupuestoList);
          // this.getTableDataGeneral();
          this.dataSource = new MatTableDataSource<any>(this.presupuestoList);
          this.calculateTotalPages(this.totalDataPatient, this.pageSize);
        })
      }
    
      getTableDataGeneral(){
        this.presupuestoList = [];
        this.serialNumberArray = [];
        
        this.appointment_generals.map((res: any, index: number) => {
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
        this.appointment_selected = staff;
      }
    
      deletePatient(){
        this.presupuestoService.deletePresupuesto(this.appointment_selected.id).subscribe((resp:any)=>{
          // console.log(resp);
    
          if(resp.message == 403){
            this.text_validation = resp.message_text;
          }else{
    
            const INDEX = this.presupuestoList.findIndex((item:any)=> item.id == this.appointment_selected.id);
          if(INDEX !=-1){
            this.presupuestoList.splice(INDEX,1);
    
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
        this.getTableData();
        this.searchDataValue = '';
        this.speciality_id = 0;
        this.date= null;
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

      cambiarStatus(data:any){
        const VALUE = data.status;
        console.log(VALUE);
        
        this.presupuestoService.updateStatus(data, data.id).subscribe(
          resp =>{
            //  this.text_success = 'Se guardó la informacion del Laboratorio con la cita'
            //                   Swal.fire({
            //                     position: "top-end",
            //                     icon: "success",
            //                     title: this.text_success,
            //                     showConfirmButton: false,
            //                     timer: 1500
            //                   });
            this.getTableData();
          }
        )
      }

}
