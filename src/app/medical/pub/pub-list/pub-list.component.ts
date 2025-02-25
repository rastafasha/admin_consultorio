import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { FileSaverService } from 'ngx-filesaver';
import { routes } from 'src/app/shared/routes/routes';
import { PaymentService } from '../../appointment-pay/service/payment.service';
import { DoctorService } from '../../doctors/service/doctor.service';
import { PubService } from '../service/pub.service';

declare var $:any;  
@Component({
  selector: 'app-pub-list',
  templateUrl: './pub-list.component.html',
  styleUrls: ['./pub-list.component.scss']
})
export class PubListComponent {
  public routes = routes;
  titlePage = 'Listado de Publicidad';
  public publicidadList: any = [];
  public publicidads: any ;
  public publicidadd: any ;
  dataSource!: MatTableDataSource<any>;

  public showFilter = false;
  public searchDataValue = '';
  public searchReferencia = '';
  public lastIndex = 0;
  public pageSize = 10;
  public totalDataPublicidad = 0;
  public skip = 0;
  public limit: number = this.pageSize;
  public pageIndex = 0;
  public serialNumberArray: Array<number> = [];
  public currentPage = 1;
  public pageNumberArray: Array<number> = [];
  public pageSelection: Array<any> = [];
  public totalPages = 0;

  public publicidad_generals:any = [];
  public publicidad_id:any;
  public publicidad_selected:any;
  public imagen:any;
  public user:any;
  public roles:any;

  public FILE_AVATAR:any;
  public IMAGE_PREVISUALIZA:any = 'assets/img/user-06.jpg';

  public text_success = '';
  public text_validation = '';

  constructor(
    public pubService: PubService,
    public doctorService: DoctorService,
    public roleService: DoctorService,
    ){

  }
  ngOnInit() {
    window.scrollTo(0, 0);
    this.doctorService.closeMenuSidebar();
    this.getTableData();
    this.user = this.roleService.authService.user;
    this.roles = this.user.roles[0];
    
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

  

  private getTableData(page=1): void {
    this.publicidadList = [];
    this.serialNumberArray = [];

    this.pubService.listPubs().subscribe((resp:any)=>{
      // console.log(resp.payments.data);
      this.publicidadList = resp.pubs.data;

      this.totalDataPublicidad = resp.pubs.length;
      this.publicidad_generals = resp.pubs.data;
      // this.patient_id = resp.patients.id;
      this.getTableDataGeneral();
      this.dataSource = new MatTableDataSource<any>(this.publicidadList);
      this.calculateTotalPages(this.totalDataPublicidad, this.pageSize);
    })
  }

  getTableDataGeneral(){
    this.publicidadList = [];
    this.serialNumberArray = [];
    
    this.publicidad_generals.map((res: any, index: number) => {
      const serialNumber = index + 1;
      if (index >= this.skip && serialNumber <= this.limit) {
       
        this.publicidadList.push(res);
        this.serialNumberArray.push(serialNumber);
      }
    });
    this.dataSource = new MatTableDataSource<any>(this.publicidadList);
    this.calculateTotalPages(this.totalDataPublicidad, this.pageSize);
  }
  

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public searchData() {
    // this.dataSource.filter = value.trim().toLowerCase();
    // this.publicidadList = this.dataSource.filteredData;
    this.pageSelection = [];
    this.limit = this.pageSize;
    this.skip = 0;
    this.currentPage = 1;
    this.getTableData();
  }

  public sortData(sort: any) {
    const data = this.publicidadList.slice();

    if (!sort.active || sort.direction === '') {
      this.publicidadList = data;
    } else {
      this.publicidadList = data.sort((a, b) => {
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
  }

  private calculateTotalPages(totalDataPayment: number, pageSize: number): void {
    this.pageNumberArray = [];
    this.totalPages = totalDataPayment / pageSize;
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
    
    this.pubService.updateStatus(data, data.id).subscribe(
      resp =>{
        console.log(resp);
        // Swal.fire('Actualizado', `actualizado correctamente`, 'success');
        // this.toaster.open({
        //   text:'Producto Actualizado!',
        //   caption:'Mensaje de Validación',
        //   type:'success',
        // })
        this.getTableData();
      }
    )
  }

  deletePublicidad(){

    this.pubService.deletePub(this.publicidad_selected.id).subscribe((resp:any) => {
      // console.log(resp);
      const INDEX = this.publicidadList.findIndex((item:any) => item.id == this.publicidad_selected.id);
      if(INDEX != -1){
        this.publicidadList.splice(INDEX,1);

        $('#delete_publicidad').hide();
        $("#delete_publicidad").removeClass("show");
        $(".modal-backdrop").remove();
        $("body").removeClass();
        $("body").removeAttr("style");

        this.publicidad_selected = null;
      }
    })
  }

  loadFile($event:any){
    if($event.target.files[0].type.indexOf("image")){
      this.text_validation = 'Solamente pueden ser archivos de tipo imagen';
      return;
    }
    this.text_validation = '';
    this.FILE_AVATAR = $event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(this.FILE_AVATAR);
    reader.onloadend = ()=> this.IMAGE_PREVISUALIZA = reader.result;
  }

  addPublicidad(){
    const formData = new FormData();
    formData.append('imagen', this.FILE_AVATAR);

    this.pubService.createPub(formData).subscribe((resp:any) => {
      // console.log(resp);
      const INDEX = this.publicidadList.findIndex((item:any) => item.id == this.publicidad_selected.id);
      // this.text_success = "La publicidad se registró correctamente";
      if(INDEX != -1){
        this.publicidadList.splice(INDEX,1);


        $('#add_publicidad').hide();
        $("#add_publicidad").removeClass("show");
        $(".modal-backdrop").remove();
        $("body").removeClass();
        $("body").removeAttr("style");

        this.publicidad_selected = null;
        this.getTableData();
      }
    })
  }
  editPublicidad(publicidad:any){
    const formData = new FormData();
    formData.append('imagen', this.FILE_AVATAR);
    // formData.append('id', this.publicidad_id);

    this.pubService.editPub(formData, publicidad.id).subscribe((resp:any) => {
      // console.log(resp);
      const INDEX = this.publicidadList.findIndex((item:any) => item.id == this.publicidad_selected.id);
      // this.text_success = "La publicidad se Actualizó correctamente";
      if(INDEX != -1){
        this.publicidadList.splice(INDEX,1);
        
        $('#edit_publicidad').hide();
        $("#edit_publicidad").removeClass("show");
        $(".modal-backdrop").remove();
        $("body").removeClass();
        $("body").removeAttr("style");

        this.publicidad_selected = null;
        this.FILE_AVATAR = null;
        this.IMAGE_PREVISUALIZA = null;
        this.getTableData();
      }
    })
  }

  closeReload(){
    this.getTableData();
  }

  selectPublicidad(publicidad:any){
    this.publicidad_selected = publicidad;
    this.IMAGE_PREVISUALIZA = this.publicidad_selected.avatar;
    // console.log(this.IMAGE_PREVISUALIZA);
    this.publicidad_selected.id;
    // this.getPublicidad();
  }

  getPublicidad(){
    this.pubService.getPub(this.publicidad_selected.id).subscribe((resp:any)=>{
      console.log(resp);
      this.publicidadd = resp.publicidad;
    })
  }


}
