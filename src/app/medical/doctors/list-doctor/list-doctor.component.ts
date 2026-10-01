import { Component } from '@angular/core';
import { DoctorService } from '../../../services/doctor.service';
import { MatTableDataSource } from '@angular/material/table';
import { RolesService } from '../../../services/roles.service';
import { routes } from '../../../shared/routes/routes';


declare var $:any;  
@Component({
    selector: 'app-list-doctor',
    templateUrl: './list-doctor.component.html',
    styleUrls: ['./list-doctor.component.scss'],
    standalone: false
})
export class ListDoctorComponent {

  public routes = routes;

  public doctorList: any = [];
  dataSource!: MatTableDataSource<any>;

  public showFilter = false;
  public searchDataValue = '';
  public lastIndex = 0;
  public pageSize = 10;
  public totalDatadoctor = 0;
  public skip = 0;
  public limit: number = this.pageSize;
  public pageIndex = 0;
  public serialNumberArray: Array<number> = [];
  public currentPage = 1;
  public pageNumberArray: Array<number> = [];
  public pageSelection: Array<any> = [];
  public totalPages = 0;

  public doctor_generals:any = [];
  public doctor_id:any;
  public doctor_selected:any;
  public text_validation:any;
  public user:any;
  isLoading = false;

  titlePage = 'Listado de Doctores';

   info_mis_doctores_list = `
  <p>En esta sección :</p>
          <ul>
            <li>Tedrás la lista completa de tus Doctores</li>
            <li>Con el botón + podras agregar a tu lista</li>
            <li>Con iconos de Documentos podrás descargar en formato excel, texto y CSV esta lista para respaldo</li>
            <li>Al Pulsar sobre el nombre del medico podras ver la ficha médica e información adicional </li>
            <li>Al final de la lista en cada medico en el boton selector (3 puntos), podrás editar, borrar y ver </li>
          </ul>`;

  constructor(
    public doctorService: DoctorService,
    public roleService: RolesService,
    ){

  }
  ngOnInit() {
    window.scrollTo(0, 0);
    this.doctorService.closeMenuSidebar();
    this.getTableData();
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
  
  private getTableData(): void {
    this.doctorList = [];
    this.serialNumberArray = [];
    this.isLoading = true;

    this.doctorService.listDoctors().subscribe((resp:any)=>{
      
      // console.log(resp);

      this.totalDatadoctor = resp.users.data.length;
      this.doctor_generals = resp.users.data;
      this.doctor_id = resp.users.id;
     this.getTableDataGeneral();
     this.isLoading = false;
    })

  }

  getTableDataGeneral(){
    this.doctorList = [];
    this.serialNumberArray = [];
    this.isLoading = true;
    
    this.doctor_generals.map((res: any, index: number) => {
      const serialNumber = index + 1;
      if (index >= this.skip && serialNumber <= this.limit) {
       
        this.doctorList.push(res);
        this.serialNumberArray.push(serialNumber);
      }
    });
    this.dataSource = new MatTableDataSource<any>(this.doctorList);
    this.calculateTotalPages(this.totalDatadoctor, this.pageSize);
    this.isLoading = false;
  }
  selectUser(doctor:any){
    this.doctor_selected = doctor;
  }
  deleteRol(){

    this.doctorService.deleteDoctor(this.doctor_selected.id).subscribe((resp:any)=>{
      // console.log(resp);

      if(resp.message == 403){
        this.text_validation = resp.message_text;
      }else{

        const INDEX = this.doctorList.findIndex((item:any)=> item.id == this.doctor_selected.id);
      if(INDEX !=-1){
        this.doctorList.splice(INDEX,1);

        $('#delete_patient').hide();
        $("#delete_patient").removeClass("show");
        $(".modal-backdrop").remove();
        $("body").removeClass();
        $("body").removeAttr("style");
        this.doctor_selected = null;
      }
      }

      
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public searchData(value: any): void {
    this.dataSource.filter = value.trim().toLowerCase();
    this.doctorList = this.dataSource.filteredData;
  }

  public sortData(sort: any) {
    const data = this.doctorList.slice();

    if (!sort.active || sort.direction === '') {
      this.doctorList = data;
    } else {
      this.doctorList = data.sort((a, b) => {
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
    this.ngOnInit();
    this.searchDataValue = '';
  }

  private calculateTotalPages(totalDatadoctor: number, pageSize: number): void {
    this.pageNumberArray = [];
    this.totalPages = totalDatadoctor / pageSize;
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
    
    this.doctorService.updateStatus(data, data.id).subscribe(
      resp =>{
        // console.log(resp);
        this.getTableData();
      }
    )
  }

}
