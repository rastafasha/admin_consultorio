import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FileSaverService } from 'ngx-filesaver';
import { routes } from 'src/app/shared/routes/routes';
import { DoctorService } from '../../../services/doctor.service';
import { LaboratoryService } from '../../../services/laboratory.service';
import { RolesService } from '../../../services/roles.service';
import { PresupuestoService } from '../../../services/presupuesto.service';
import { SpecialitieService } from '../../../services/specialitie.service';
import Swal from 'sweetalert2';
import { Speciality } from 'src/app/models/speciality.model';
import { Permissions, User } from 'src/app/models/user.model';
import { Presupuesto } from 'src/app/models/presupuesto.model';
import { catchError } from 'rxjs';
import { throwError } from 'rxjs';
declare var $: any;
@Component({
  selector: 'app-presupuesto-lista',
  templateUrl: './presupuesto-lista.component.html',
  styleUrls: ['./presupuesto-lista.component.scss']
})
export class PresupuestoListaComponent implements OnInit {

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

  public presupuestoList: Presupuesto[] = [];
  public selectedPresupuestoId: number | null = null;
  public text_validation = '';

  public speciality_id = 0;
  public date: string | null = null;

  specialities: Speciality[] = [];
  public user!: User;
  public doctor_id = 0;
  public roles: string[] = [];

  DOCTOR_SELECTED!: User;


  constructor(
    public presupuestoService: PresupuestoService,
    public doctorService: DoctorService,
    public laboratoryService: LaboratoryService,
    public roleService: RolesService,
    public specialitiService: SpecialitieService,
  ) {

  }
  ngOnInit() {
    window.scrollTo(0, 0);
    this.doctorService.closeMenuSidebar();
    this.getSpecialities();
    this.user = this.roleService.authService.user;
    this.roles = Array.isArray(this.user.roles) ? this.user.roles.map(r => r.name || r) : [this.user.roles?.name || this.user.roles || ''];
    if (this.roles.includes('DOCTOR')) {
      this.doctor_id = this.user.id;
      this.getDoctor();
    }
    this.getTableData();
  }

  getDoctor() {

    this.doctorService.showDoctor(this.doctor_id).subscribe({
      next: (resp: any) => {
        this.DOCTOR_SELECTED = resp.user;
        this.speciality_id = this.DOCTOR_SELECTED.speciality_id;
        this.specialitiService.showSpeciality(this.speciality_id).subscribe();
      },
      error: (err) => Swal.fire('Error', 'Failed to load doctor', 'error')
    });
  }

  getSpecialities() {
    this.presupuestoService.listConfig().subscribe({
      next: (resp: any) => {
        this.specialities = resp.specialities || [];
      },
      error: (err) => Swal.fire('Error', 'Failed to load specialities', 'error')
    });
  }

  isPermission(permission: string): boolean {
    if (this.roles.includes('SUPERADMIN')) {
      return true;
    }
    return (this.user.permissions as unknown as string[]).includes(permission);
  }

  private getTableData(page = 1): void {
    this.serialNumberArray = [];
    this.isLoading = true;

    this.presupuestoService.listPresupuestos(page, this.searchDataValue, this.speciality_id, this.date).subscribe({
      next: (resp: any) => {
        this.isLoading = false;
        this.totalDataPatient = resp.total;
        this.presupuestoList = resp.data || [];
        this.dataSource = new MatTableDataSource<Presupuesto>(this.presupuestoList);
        this.calculateTotalPages(this.totalDataPatient, this.pageSize);
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire('Error', 'Failed to load budgets', 'error');
      }
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

  public searchData() {
    this.currentPage = 1;
    this.getTableData();
  }

  public sortData(sort: { active: string, direction: string }) {
    // Client-side sort disabled for server-side pagination
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
    this.date = null;
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

  cambiarStatus(data: Presupuesto) {
    this.presupuestoService.updateStatus({ status: data.status }, data.id).subscribe({
      next: (resp) => {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Status actualizado",
          showConfirmButton: false,
          timer: 1500
        });
        this.getTableData();
      },
      error: (err) => Swal.fire('Error', 'Failed to update status', 'error')
    });
  }

  onDeletePresupuesto(id: number) {
    this.deletePresupuesto(id);
  }

}
