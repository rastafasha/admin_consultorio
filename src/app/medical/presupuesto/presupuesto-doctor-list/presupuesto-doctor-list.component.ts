import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FileSaverService } from 'ngx-filesaver';
import Swal from 'sweetalert2';
import { DoctorService } from '../../../services/doctor.service';
import { RolesService } from '../../../services/roles.service';
import * as XLSX from 'xlsx';
import { PresupuestoService } from '../../../services/presupuesto.service';
import { Presupuesto } from '../../../models/presupuesto.model';
import { User } from '../../../models/user.model';
import { routes } from '../../../shared/routes/routes';
declare var $:any;
@Component({
    selector: 'app-presupuesto-doctor-list',
    templateUrl: './presupuesto-doctor-list.component.html',
    styleUrls: ['./presupuesto-doctor-list.component.scss'],
    standalone: false
})
export class PresupuestoDoctorListComponent implements OnInit {
  public routes = routes;
  titlePage = 'Mis Presupuestos';

  public presupuestoList: Presupuesto[] = [];
  dataSource!: MatTableDataSource<Presupuesto>;

  public searchDataValue = '';
  public searchDataPatient = '';
  public pageSize = 10;
  public totalDataPatient = 0;
  public currentPage = 1;
  public pageNumberArray: number[] = [];
  public pageSelection: Array<{skip: number, limit: number}> = [];
  public totalPages = 0;
  public serialNumberArray: number[] = [];

  public isLoading = false;
  public showFilter = false;
  public lastIndex = 0;
  public skip = 0;
  public limit: number = this.pageSize;
  public pageIndex = 0;

  public speciality_id = 0;
  public date: string | null = null;
  specialities: any[] = [];

  public user!: User;
  public doctor_id = 0;
  public selectedPresupuestoId: number | null = null;
  public text_validation = '';

  public roles: string[] = [];
  info_mis_presupuestos_list = `
  <p>En esta sección :</p>
          <ul>
            <li>Podrás la lista completa de tus Presupuestos</li>
            <li>Con el botón + podras crear a tu lista</li>
            <li>Encontrar por nombre del paciente, fecha</li>
            <li>Al final de la lista en cada paciente en el boton selector (3 puntos), podrás crear Recipe para ese paciente, editar y ver </li>
          </ul>`;

  constructor(
    public presupuestoService: PresupuestoService,
    public doctorService: DoctorService,
    private fileSaver: FileSaverService,
    public roleService: RolesService,
    ) { }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.doctorService.closeMenuSidebar();
    
    this.getSpecialities();

    this.user = this.roleService.authService.user;
    this.doctor_id = this.user.id;
    this.getTableData();
  }

  isPermission(permission: string): boolean {
    if (this.roles.includes('SUPERADMIN')) {
      return true;
    }
    return (this.user.permissions as unknown as string[]).includes(permission);
  }

  getSpecialities(){
    this.presupuestoService.listConfig().subscribe({
      next: (resp: any) => this.specialities = resp.specialities || [],
      error: (err) => Swal.fire('Error', 'Failed to load specialities', 'error')
    });
  }


  

  private getTableData(page = 1): void {
    this.serialNumberArray = [];
    
    this.presupuestoService.listPresupuestoDocts(this.doctor_id, page, 
      this.searchDataValue, this.searchDataPatient, this.date || '').subscribe({
      next: (resp: any) => {
        this.totalDataPatient = resp.presupuestos.total;
        this.presupuestoList = resp.presupuestos.data || [];
        this.dataSource.data = this.presupuestoList;
        this.calculateTotalPages(this.totalDataPatient, this.pageSize);
      },
      error: (err) => Swal.fire('Error', 'Failed to load budgets', 'error')
    });
  }


  deletePresupuesto(id: number) {
    Swal.fire({
      title: 'Confirmar eliminación',
      text: '¿Seguro que quieres eliminar este presupuesto?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.presupuestoService.deletePresupuesto(id).subscribe({
          next: (resp: any) => {
            if (resp.message === 403) {
              Swal.fire('Error', resp.message_text || 'No autorizado', 'error');
            } else {
              this.presupuestoList = this.presupuestoList.filter(item => item.id !== id);
              this.dataSource.data = this.presupuestoList;
              Swal.fire('Eliminado', 'Presupuesto eliminado correctamente', 'success');
            }
          },
          error: (err) => Swal.fire('Error', 'Failed to delete', 'error')
        });
      }
    });
  }

  onDeletePresupuesto(id: number) {
    this.deletePresupuesto(id);
  }

  public searchData() {
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

    // this.getTableDataGeneral();
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

    // this.getTableDataGeneral();

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

    // this.getTableDataGeneral();


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

  cambiarStatus(data:any){
    const VALUE = data.status;
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
