import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import { MatTableDataSource } from '@angular/material/table';
import { FileSaverService } from 'ngx-filesaver';
import { DoctorService } from '../../../services/doctor.service';
import { PaymentService } from '../../../services/payment.service';
import { ActivatedRoute } from '@angular/router';
import { routes } from '../../../shared/routes/routes';
import { Payment } from '../../../models/payment.model';
import Swal from 'sweetalert2';

declare var $:any;  
@Component({
    selector: 'app-list-appoiment-cobros',
    templateUrl: './list-appoiment-cobros.component.html',
    styleUrls: ['./list-appoiment-cobros.component.scss'],
    standalone: false
})
export class ListAppoimentCobrosComponent {

  public routes = routes;
  titlePage = 'Lista de Transferencias';

  public paymentList: any = [];
  public payments: any ;
  dataSource!: MatTableDataSource<any>;

  public showFilter = false;
  public searchDataValue = '';
  public searchReferencia = '';
  public lastIndex = 0;
  public pageSize = 10;
  public totalDataPayment = 0;
  public skip = 0;
  public limit: number = this.pageSize;
  public pageIndex = 0;
  public serialNumberArray: Array<number> = [];
  public currentPage = 1;
  public pageNumberArray: Array<number> = [];
  public pageSelection: Array<any> = [];
  public totalPages = 0;

  public payment_generals:any = [];
  public patient_id:any;
  public patient_selected:any;
  public user:any;
  public doctor_id:any;
  pagoSeleccionado:Payment

  constructor(
    public paymentService: PaymentService,
    public doctorService: DoctorService,
    public ativatedRoute: ActivatedRoute,
    private fileSaver: FileSaverService
    ){

  }
  ngOnInit() {
    window.scrollTo(0, 0);
    this.doctorService.closeMenuSidebar();
    this.getTableData();

    const USER = localStorage.getItem("user");
    this.user = JSON.parse(USER ? USER: '');
    // this.doctor_id = this.user.id;
    // this.user = this.roleService.authService.user;

    this.ativatedRoute.params.subscribe((resp:any)=>{
      this.doctor_id = resp.doctor_id;
      console.log(this.doctor_id);
    });
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

   openViewModal(data: any): void {
    this.pagoSeleccionado = data;

  }

 onCloseModal(): void {
    this.pagoSeleccionado = null;
}

  private getTableData(page=1): void {
    this.paymentList = [];
    this.serialNumberArray = [];

    this.paymentService.getAll(page, this.searchReferencia).subscribe((resp:any)=>{
      // console.log(resp.payments.data);
      this.paymentList = resp.payments.data;

      this.totalDataPayment = resp.total;
      this.payment_generals = resp.payments.data;
      // this.patient_id = resp.patients.id;
      this.getTableDataGeneral();
      this.dataSource = new MatTableDataSource<any>(this.paymentList);
      this.calculateTotalPages(this.totalDataPayment, this.pageSize);
    })
  }

  getTableDataGeneral(){
    this.paymentList = [];
    this.serialNumberArray = [];
    
    this.payment_generals.map((res: any, index: number) => {
      const serialNumber = index + 1;
      if (index >= this.skip && serialNumber <= this.limit) {
       
        this.paymentList.push(res);
        this.serialNumberArray.push(serialNumber);
      }
    });
    this.dataSource = new MatTableDataSource<any>(this.paymentList);
    this.calculateTotalPages(this.totalDataPayment, this.pageSize);
  }
  

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public searchData() {
    // this.dataSource.filter = value.trim().toLowerCase();
    // this.paymentList = this.dataSource.filteredData;
    this.pageSelection = [];
    this.limit = this.pageSize;
    this.skip = 0;
    this.currentPage = 1;
    this.getTableData();
  }

  public sortData(sort: any) {
    const data = this.paymentList.slice();

    if (!sort.active || sort.direction === '') {
      this.paymentList = data;
    } else {
      this.paymentList = data.sort((a, b) => {
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
    this.searchReferencia = '';
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


  excelExport(){
    const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=UTF-8';
    const EXCLE_EXTENSION = '.xlsx';

    this.getTableDataGeneral();


    //custom code
    const worksheet = XLSX.utils.json_to_sheet(this.paymentList);

    const workbook = {
      Sheets:{
        'testingSheet': worksheet
      },
      SheetNames:['testingSheet']
    }

    const excelBuffer = XLSX.write(workbook, {bookType:'xlsx', type: 'array'});

    const blobData = new Blob([excelBuffer],{type: EXCEL_TYPE});

    this.fileSaver.save(blobData, "transferencias_db_appcitasmedicas",)

  }
  csvExport(){
    const CSV_TYPE = 'text/csv';
    const CSV_EXTENSION = '.csv';

    this.getTableDataGeneral();

    //custom code
    const worksheet = XLSX.utils.json_to_sheet(this.paymentList);

    const workbook = {
      Sheets:{
        'testingSheet': worksheet
      },
      SheetNames:['testingSheet']
    }

    const excelBuffer = XLSX.write(workbook, {bookType:'csv', type: 'array'});

    const blobData = new Blob([excelBuffer],{type: CSV_TYPE});

    this.fileSaver.save(blobData, "transferencias_db_appcitasmedicas", CSV_EXTENSION)

  }

  txtExport(){
    const TXT_TYPE = 'text/txt';
    const TXT_EXTENSION = '.txt';

    this.getTableDataGeneral();


    //custom code
    const worksheet = XLSX.utils.json_to_sheet(this.paymentList);

    const workbook = {
      Sheets:{
        'testingSheet': worksheet
      },
      SheetNames:['testingSheet']
    }

    const excelBuffer = XLSX.write(workbook, {bookType:'xlsx', type: 'array'});

    const blobData = new Blob([excelBuffer],{type: TXT_TYPE});

    this.fileSaver.save(blobData, "transferencias_db_appcitasmedicas", TXT_EXTENSION)

  }

  pdfExport(){
    // var doc = new jspdf(); 
    
    // const worksheet = XLSX.utils.json_to_sheet(this.patientList);

    // const workbook = {
    //   Sheets:{
    //     'testingSheet': worksheet
    //   },
    //   SheetNames:['testingSheet']
    // }

    // doc.html(document.body, {
    //   callback: function (doc) {
    //     doc.save('patients_db_appcitasmedicas.pdf');
    //   }
    // });

  }

  // cambiarStatus(data:any){
  //   const VALUE = data.status;
  //   console.log(VALUE);
    
  //   this.paymentService.updateStatus(data, data.id).subscribe(
  //     resp =>{
  //       console.log(resp);
  //       // Swal.fire('Actualizado', `actualizado correctamente`, 'success');
  //       // this.toaster.open({
  //       //   text:'Producto Actualizado!',
  //       //   caption:'Mensaje de Validación',
  //       //   type:'success',
  //       // })
  //       this.getTableData();
  //     }
  //   )
  // }

   cambiarStatus(data: any) {
      const nuevoEstado = data.status;
      const monto = data.monto; // Extraemos de una vez
      const appointment_id = data.appointment_id;
      const id = data.id;
  
      // 1. Caso: RECHAZADO (Pide motivo)
      if (nuevoEstado === 'REJECTED') {
        Swal.fire({
          title: 'Motivo del Rechazo',
          input: 'text',
          inputPlaceholder: 'Ej: Capture borroso, monto incompleto...',
          showCancelButton: true,
          confirmButtonText: 'Rechazar y Notificar',
          confirmButtonColor: '#d33', // Rojo para peligro
          cancelButtonText: 'Cancelar',
          inputValidator: (value) => {
            if (!value) return '¡Debes escribir un motivo para el usuario!';
            return null;
          }
        }).then((result) => {
          if (result.isConfirmed) {
            this.ejecutarUpdateStatus(id, nuevoEstado, monto, appointment_id, result.value);
          } else {
            this.getTableData(); // Revierte el select si cancela
          }
        });
  
      // 2. Caso: APROBADO (Confirmación de seguridad)
      } else if (nuevoEstado === 'APPROVED') {
        Swal.fire({
          title: '¿Confirmar Pago?',
          text: `¿Estás seguro de marcar como APROBADO el pago de ${data.monto}?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Sí, Aprobar',
          confirmButtonColor: '#198754', // Verde para éxito
          cancelButtonText: 'No, revisar'
        }).then((result) => {
          if (result.isConfirmed) {
            this.ejecutarUpdateStatus(id, nuevoEstado, monto, appointment_id);
          } else {
            this.getTableData(); // Revierte el select si se arrepiente
          }
        });
  
      } else {
        // 3. Caso: PENDIENTE (Cambio directo)
        this.ejecutarUpdateStatus(id, nuevoEstado, monto, appointment_id);
      }
  }
  
  
  // Función auxiliar para no repetir código del subscribe
  private ejecutarUpdateStatus(id: number, nuevoEstado: string, 
    monto: any,          // <--- Nuevo parámetro
    appointment_id: any,
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    motivo_rechazo: string = '',
  ) {
      const payload = {
        id:id,
        status: nuevoEstado,
        motivo_rechazo: motivo_rechazo,
         monto: monto,            // <--- Usa el parámetro
         amount: monto,            // <--- Usa el parámetro
        appointment_id: appointment_id 
      };
  
      this.paymentService.updateStatus(payload, id).subscribe({
        next: (resp) => {
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: nuevoEstado === 'APPROVED' ? '✅ Pago Aprobado' : '❌ Pago Rechazado',
            color: 'gray',
            showConfirmButton: false,
            timer: 1500,
          });
          this.getTableData();
        },
        error: (err) => {
          Swal.fire('Error', 'No se pudo actualizar el pago', 'error');
          this.getTableData();
        }
      });
  }
}
