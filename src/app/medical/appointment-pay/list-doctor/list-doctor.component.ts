import { Component, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { AppoitmentPayService } from '../../../services/appoitment-pay.service';
import { FileSaverService } from 'ngx-filesaver';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { DoctorService } from '../../../services/doctor.service';
import { ActivatedRoute } from '@angular/router';
import { SettignService } from '../../../core/settings/settigs.service';
import { routes } from '../../../shared/routes/routes';

declare var $:any;
@Component({
    selector: 'app-list-doctor',
    templateUrl: './list-doctor.component.html',
    styleUrls: ['./list-doctor.component.scss'],
    standalone: false
})
export class ListDoctorComponent {

  @ViewChild('closebutton') closebutton:any;

  titlePage = 'Mis Pagos de Citas';
  public routes = routes;
  public selectedValue !: string  ;
  public searchDataValue = '';
  public searchDataDoctor = '';

  public appointmentList: any = [];
  dataSource!: MatTableDataSource<any>;

  public showFilter = false;
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
  public appointment_selected:any;

  public payment_selected:any;

  public speciality_id= 0;
  public specialities:any = [];
  
  public picker1:any;
  public picker2:any;
  public date_start:any;
  public date_end:any;
  public method_payment = '';
  public amount_add = 0;

  public text_success = '';
  public text_validation = '';

  public user:any;
  public doctor_id:any;
  public tiposdepagos:any;

  info_cobros = `
  <p>En esta sección :</p>
          <ul>
            <li>Lista de Pagos Recibidos</li>
            <li>Filtrar por nombre, fechas Desde y hasta</li>
            <li>Cambiar el Estado del pago</li>
            <li>Colocar el monto pagado total o Abonado</li>
            <li>Podrás Editar el pago recibido por las opciones creadas</li>
            <li>Generar un Nuevo Pago con el monto pagado total o Abonado</li>
            <li>Esta información es necesaria para ver tus avances finacieros</li>
          </ul>`;

  constructor(
    public appointmentpayService : AppoitmentPayService,
    public doctorService : DoctorService,
    public ativatedRoute : ActivatedRoute,
    public settigService : SettignService,
    private fileSaver: FileSaverService
    ){

  }
  ngOnInit() {
    window.scrollTo(0, 0);
    this.doctorService.closeMenuSidebar();
    

    const USER = localStorage.getItem("user");
    this.user = JSON.parse(USER ? USER: '');
    // this.doctor_id = this.user.id;
    // this.user = this.roleService.authService.user;

    this.ativatedRoute.params.subscribe((resp:any)=>{
      this.doctor_id = resp.doctor_id;
      console.log(this.doctor_id);
    });

    this.getTableData();
    this.getSpecialities();
    this.getTiposdePagoByDoctor()
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
    this.appointmentpayService.listConfig().subscribe((resp:any)=>{
      this.specialities = resp.specialities;
    })
  }

  getTiposdePagoByDoctor(){
    this.settigService.getActivoPagoByDoctor(this.doctor_id).subscribe((resp:any)=>{
      // console.log(resp);
      this.tiposdepagos = resp.tiposdepagos;
      // console.log(this.tiposdepagos);
    })
}
  
  private getTableData(page=1): void {
    this.appointmentList = [];
    this.serialNumberArray = [];

    this.appointmentpayService.listAppointmentPaysByDoctor(this.doctor_id, page, this.searchDataValue, 
     this.date_start,this.date_end).subscribe((resp:any)=>{
      console.log(resp);

      this.totalDataPatient = resp.total;
      this.appointmentList = resp.appointmentpays;
      // this.getTableDataGeneral();
      this.dataSource = new MatTableDataSource<any>(this.appointmentList);
      this.calculateTotalPages(this.totalDataPatient, this.pageSize);
    })
  }

  

  addPayment(data:any){
    this.text_validation = '';
    if(!this.method_payment || !this.amount_add){
      this.text_validation = "Se Requiere todos los campos"
      return;
    }
    const dataD ={
      appointment_id: data.id,
      appointment_total: data.amount,
      amount: this.amount_add,
      method_payment: this.method_payment
    }
    this.appointmentpayService.storeAppointmentPay(dataD).subscribe((resp:any)=>{
      if(resp.message == 403){
        this.text_validation = resp.message_text;
      }else{
        this.text_success = "El Pago se registró correctamente";
        data.payment.push(resp.appointmentpay);

        const INDEX = this.appointmentList.findIndex((appo:any)=>appo.id == data.id);
        if(INDEX != -1){
          this.appointmentList[INDEX].status_pay = !resp.appointmentpay.is_total_payment ? 2: 1;
        }
        this.amount_add = 0;
        this.method_payment = ''; 
        
        // $('#add_payment').hide();
        // $("#add_payment").removeClass("show");
        // $(".modal-backdrop").remove();
        // $("body").removeClass();
        // $("body").removeAttr("style");
        // this.closebutton.nativeElement.click();
         // 🚀 Invocamos el cierre nativo e independiente de jQuery
        this.closeModalCleanly();
        this.getTableData();
      }
    })
  }

  selectPayment(payment:any){
    this.payment_selected = payment;
    console.log(payment)
  }

  selectEditPayment(payment:any){
    this.payment_selected = payment;
    this.text_validation = '';
    this.text_success = '';
    this.amount_add = this.payment_selected.amount;
    this.method_payment  = this.payment_selected.method_payment;

  }

  clearData(){
    this.amount_add = 0;
    this.method_payment = '';
    this.text_validation = '';
    this.text_success = '';
  }

    editPayment(data: any) {
    this.text_validation = '';
    
    // 🚀 CORREGIDO: Usamos las variables correctas del formulario de EDICIÓN
    if (!this.method_payment || !this.amount_add) {
      this.text_validation = "Se Requiere todos los campos";
      return;
    }
    
    const dataD = {
      appointment_id: data.id,
      appointment_total: data.amount,
      amount: this.amount_add,     // 🚀 CORREGIDO
      method_payment: this.method_payment // 🚀 CORREGIDO
    };

    this.appointmentpayService.editAppointmentPay(dataD, this.payment_selected.id).subscribe((resp: any) => {
      if (resp.message == 403) {
        this.text_validation = resp.message_text;
      } else {
        this.text_success = "El Pago se Actualizó correctamente";
        
        // 🚀 SOLUCIÓN AL ERROR DE UNDEFINED:
        // Evaluamos dinámicamente si la propiedad vino en singular (payment) o en plural (payments)
        const paymentsArray = data.payment || data.payments || [];
        
        if (resp.appointmentpay && paymentsArray.length > 0) {
          const index = paymentsArray.findIndex((pay: any) => pay.id == resp.appointmentpay.id);
          if (index != -1) {
            paymentsArray[index] = resp.appointmentpay;
          }
        }

        const INDEX = this.appointmentList.findIndex((appo: any) => appo.id == data.id);
        if (INDEX != -1 && resp.appointmentpay) {
          this.appointmentList[INDEX].status_pay = !resp.appointmentpay.is_total_payment ? 2 : 1;
        }
        
        // Limpiamos las variables globales de edición
        this.amount_add = 0;
        this.method_payment = '';   

        // 🚀 Invocamos el cierre nativo e independiente de jQuery
        this.closeModalCleanly();
        
        // Refrescamos la tabla con los datos nuevos
        this.getTableData();
      }
    });
  }

  private closeModalCleanly() {
    setTimeout(() => {
      // 🚀 SOLUCIÓN SIN JQUERY: Buscamos el botón de cerrar nativo de Bootstrap del modal que esté abierto
      const activeModalCloseBtn = document.querySelector('.modal.show [data-bs-dismiss="modal"]') as HTMLElement;
      
      if (activeModalCloseBtn) {
        // Simulamos el clic. Bootstrap se encargará de hacer la animación y quitar el fondo negro solo
        activeModalCloseBtn.click();
      } else {
        // Resguardo de emergencia por si el backdrop se queda pegado en el DOM
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());
        document.body.classList.remove('modal-open');
        document.body.removeAttribute('style');
      }

      // Limpiamos los formularios y refrescamos la información
      this.clearData();
      this.getTableData(this.currentPage);
    }, 1200);
  }


  closeReload(){
    this.getTableData();
  }

  deletePayment(data:any){
    this.appointmentpayService.deleteAppointmentPay(this.payment_selected.id).subscribe((resp:any)=>{
      // console.log(resp);

      if(resp.message == 403){
        this.text_validation = resp.message_text;
      }else{

        const INDEX = data.payments.findIndex((item:any)=> item.id == this.payment_selected.id);

        const INDEX2 = this.appointmentList.findIndex((appo:any)=>appo.id == data.id);
        if(INDEX2 != -1){
          this.appointmentList[INDEX2].status_pay = 2;
        }

      if(INDEX !=-1){
        data.payments.splice(INDEX,1);

        $('#delete_payment').hide();
        $("#delete_payment").removeClass("show");
        $(".modal-backdrop").remove();
        $("body").removeClass();
        $("body").removeAttr("style");

        

        this.payment_selected = null;
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
    this.getTableData();
    this.searchDataValue = '';
    this.searchDataDoctor = '';
    this.searchDataDoctor = '';
    this.speciality_id = 0;
    this.picker1= null;
    this.picker2= null;
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

    this.getTableData();


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

    this.fileSaver.save(blobData, "pagoscitas_db_appcitasmedicas",)

  }
  csvExport(){
    const CSV_TYPE = 'text/csv';
    const CSV_EXTENSION = '.csv';

    this.getTableData();

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

    this.fileSaver.save(blobData, "pagoscitas_db_appcitasmedicas", CSV_EXTENSION)

  }

  txtExport(){
    const TXT_TYPE = 'text/txt';
    const TXT_EXTENSION = '.txt';

    this.getTableData();


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

    this.fileSaver.save(blobData, "pagoscitas_db_appcitasmedicas", TXT_EXTENSION)

  }

  

}
