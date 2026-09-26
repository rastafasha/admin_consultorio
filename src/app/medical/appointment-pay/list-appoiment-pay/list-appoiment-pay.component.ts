import { Component, OnInit, ViewChild, inject } from '@angular/core'; // 🚀 Añadido inject
import { MatTableDataSource } from '@angular/material/table';
import { AppoitmentPayService } from '../../../services/appoitment-pay.service';
import { DoctorService } from '../../../services/doctor.service';
import { RolesService } from '../../../services/roles.service';
import { ClinicaService } from '../../../services/clinica.service'; // 🏢 Inyectado para control Tenant
import { SettignService } from '../../../services/settigs.service'; // 🏢 Inyectado para leer ID de clínica

import { routes } from '../../../shared/routes/routes';
import { switchMap, of } from 'rxjs';
import { environment } from '../../../../environments/environment';

declare var $:any;

@Component({
    selector: 'app-list-appoiment-pay',
    templateUrl: './list-appoiment-pay.component.html',
    styleUrls: ['./list-appoiment-pay.component.scss'],
    standalone: false
})
export class ListAppoimentPayComponent {

 @ViewChild('closebutton') closebutton: any;

  titlePage = 'Lista de Pagos de Citas';
  public routes = routes;
  public selectedValue!: string;
  public searchDataValue = '';
  public searchDataDoctor = '';

  public appointmentList: any = [];
  dataSource!: MatTableDataSource<any>;

  public showFilter = false;
  public isLoading = false;

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

  public appointment_generals: any = [];
  public appointment_id: any;
  public appointment_selected: any;
  public payment_selected: any;

  public speciality_id = 0;
  public specialities: any = [];
  
  public picker1: any;
  public picker2: any;
  public date_start: any;
  public date_end: any;
  public method_payment = '';
  public amount_add = 0;

  public text_success = '';
  public text_validation = '';
  user: any;
  roles: any;

  // 🔒 PROPIEDADES MULTI-TENANT ENTERPRISE:
  public readonly isClinicMode = environment.IS_CLINIC_DEPLOYMENT;
  public targetTenantId: any = null;
info_pagos_citas = `
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
  // 🚀 Inyección moderna libre de constructores rústicos
  private clinicaService = inject(ClinicaService);
  private settingService = inject(SettignService);
  public appointmentpayService = inject(AppoitmentPayService);
  public doctorService = inject(DoctorService);
  public roleService = inject(RolesService);


  ngOnInit() {
    window.scrollTo(0, 0);
    this.doctorService.closeMenuSidebar();
    this.user = this.roleService.authService.user;
    this.roles = this.user?.roles?.[0];

    // 🏁 Arrancamos resolviendo el contexto del establecimiento antes de poblar la tabla
    this.inicializarContextoContable();
    this.getSpecialities();
  }

  /**
   * 🏢🩺 MOTOR POLIMÓRFICO: Calcula síncronamente quién es el dueño de la caja de abonos
   */
  private inicializarContextoContable(): void {
    this.isLoading = true;
    const slugActual = this.clinicaService.obtenerSlugDeUrl();

    this.clinicaService.getClinicaBySlugCached(slugActual).pipe(
      switchMap((clinica) => {
        // Caso Clínica Enterprise: Buscamos el ID del registro de configuración general
        if (clinica && clinica.tipoClinica === 'Clinica') {
          return this.settingService.getAllSettings().pipe(
            switchMap((respSettings: any) => {
              // 🚀 CORRECCIÓN CRÍTICA: Apuntamos estrictamente al primer objeto del arreglo [0]
              const currentSetting = respSettings?.settings?.data?.[0] || respSettings?.settings?.data;
              
              // Evaluamos si el ID viene directo o anidado en el objeto
              const finalId = currentSetting?.id || null;
              
              return of({ isEnterprise: true, id: finalId });
            })
          );
        }
        // Caso Consultorio Médico: Mantiene el ID del doctor logueado
        return of({ isEnterprise: false, id: this.user?.id });
      })
    ).subscribe({
      next: (contexto: any) => {
        // Asignamos el ID resolved y descongelamos la carga de la grilla
        this.targetTenantId = contexto.id;
        
        console.log(`💳 [Caja Sincronizada] ID Propietario de la transacción: ${this.targetTenantId}`);
        
        this.getTableData();
      },
      error: (err) => {
        console.error("❌ Error resolviendo contexto multi-tenant en caja:", err);
        this.isLoading = false;
      }
    });
  }

  isPermission(permission: string) {
    if (this.user?.roles?.includes('SUPERADMIN')) {
      return true;
    }
    if (this.user?.permissions?.includes(permission)) {
      return true;
    }
    return false;
  }

  getSpecialities() {
    this.appointmentpayService.listConfig().subscribe((resp: any) => {
      this.specialities = resp.specialities;
    });
  }
  
  public getTableData(page = 1): void {
    // Salvavidas por si el componente intenta gatillar la carga antes de resolver el subdominio
  console.log(this.targetTenantId)
    if (!this.targetTenantId) return;

    this.appointmentList = [];
    this.serialNumberArray = [];
    this.isLoading = true;

    // 🚀 SANEADO CORPORATIVO: Inyectamos 'this.targetTenantId' al final de la firma del servicio
    this.appointmentpayService.listAppointmentPays(
      page, 
      this.searchDataDoctor, 
      this.searchDataValue, 
      this.speciality_id, 
      this.date_start,
      this.date_end,
      this.targetTenantId
    ).subscribe({
      next: (resp: any) => {
        this.totalDataPatient = resp.total;
        this.appointmentList = resp.appointmentpays.data;
        this.dataSource = new MatTableDataSource<any>(this.appointmentList);
        this.calculateTotalPages(this.totalDataPatient, this.pageSize);
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
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
        data.payment.push(resp.appoimentpay);

        const INDEX = this.appointmentList.findIndex((appo:any)=>appo.id == data.id);
        if(INDEX != -1){
          this.appointmentList[INDEX].status_pay = !resp.appoimentpay.is_total_payment ? 2: 1;
        }
        this.amount_add = 0;
        this.method_payment = ''; 
        
        $('#add_payment').hide();
        $("#add_payment").removeClass("show");
        $(".modal-backdrop").remove();
        $("body").removeClass();
        $("body").removeAttr("style");
        this.closebutton.nativeElement.click();
        this.getTableData();
      }
    })
  }

  selectPayment(payment:any){
    this.payment_selected = payment;
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

  editPayment(data:any){
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
    this.appointmentpayService.editAppointmentPay(dataD, this.payment_selected.id).subscribe((resp:any)=>{
      if(resp.message == 403){
        this.text_validation = resp.message_text;
      }else{
        this.text_success = "El Pago se Actualizó correctamente";
        const index = data.payments.findIndex((pay:any)=>pay.id == resp.appoimentpay.id);
        if(index != -1){
          data.payment[index] = resp.appoimentpay;
        }
        const INDEX = this.appointmentList.findIndex((appo:any)=>appo.id == data.id);
        if(INDEX != -1){
          this.appointmentList[INDEX].status_pay = !resp.appoimentpay.is_total_payment ? 2: 1;
        }
        this.amount_add = 0;
        this.method_payment = '';   

        $('#edit_payment').hide();
        $("#edit_payment").removeClass("show");
        $(".modal-backdrop").remove();
        $("body").removeClass();
        $("body").removeAttr("style");
        this.getTableData();
      }
    })
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
    this.ngOnInit();
    this.searchDataValue = '';
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

 

}
