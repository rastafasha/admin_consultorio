import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { PatientMService } from '../../../services/patient-m.service';
import { FileSaverService } from 'ngx-filesaver';
import { DoctorService } from '../../../services/doctor.service';
import * as XLSX from 'xlsx';
import { RolesService } from '../../../services/roles.service';
import { ActivatedRoute } from '@angular/router';
import { routes } from '../../../shared/routes/routes';

declare var $:any;  
@Component({
    selector: 'app-list-patient-m',
    templateUrl: './list-patient-m.component.html',
    styleUrls: ['./list-patient-m.component.scss'],
    standalone: false
})
export class ListPatientMComponent {
  public routes = routes;
  titlePage = 'Listado de Pacientes';
  public isLoading = false;
  public cargando = false;

  public patientList: any = [];
  dataSource!: MatTableDataSource<any>;

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

  public patient_generals:any = [];
  public doctorPatientList:any = [];
  public patient_id:any;
  public patient_selected:any;
  public text_validation:any;
  public user:any;
  public doctor_id:any;
  public roles:any;

  info_mis_pacientes_list = `
  <p>En esta sección :</p>
          <ul>
            <li>Tedrás la lista completa de tus Pacientes</li>
            <li>Con el botón + podras agregar a tu lista</li>
            <li>Con iconos de Documentos podrás descargar en formato excel, texto y CSV esta lista para respaldo</li>
            <li>Al Pulsar sobre el nombre del paciente podras ver la ficha médica e información adicional </li>
            <li>Al final de la lista en cada paciente en el boton selector (3 puntos), podrás crear Recipe para ese paciente, editar y ver </li>
          </ul>`;

  constructor(
    public patientService: PatientMService,
    public doctorService: DoctorService,
    public roleService: RolesService,
    public ativatedRoute: ActivatedRoute,
    private fileSaver: FileSaverService
    ){

  }
  ngOnInit() {
    window.scrollTo(0, 0);
    this.doctorService.closeMenuSidebar();
    
    // 🚀 SANEADO SEGURO: Recuperamos el usuario activo del servicio centralizado
    this.user = this.roleService.authService.user;
    
    if (this.user) {
      this.doctor_id = this.user.id;
      
      // 🛡️ VALIDACIÓN POLIMÓRFICA: Evaluamos si el rol viene como objeto de Spatie o como string plano
      if (this.user.roles && this.user.roles.length > 0) {
        const primerRol = this.user.roles[0];
        this.roles = typeof primerRol === 'object' ? primerRol.name : primerRol;
      } else {
        this.roles = 'RECEPCION'; // Valor de respaldo seguro para evitar la pantalla en blanco
      }
    } else {
      // Plan de contingencia si el Auth no ha cargado en frío
      const userLocal = localStorage.getItem("user");
      if (userLocal) {
        try {
          const parsedUser = JSON.parse(userLocal);
          this.user = parsedUser;
          this.doctor_id = parsedUser?.id;
          this.roles = parsedUser?.roles?.[0]?.name || parsedUser?.roles?.[0] || 'RECEPCION';
        } catch (e) {
          console.error("Error al parsear el usuario de respaldo:", e);
        }
      }
    }

    // Escuchamos parámetros de la ruta de forma segura
    this.ativatedRoute.params.subscribe((resp: any) => {
      if (resp && resp.doctor_id) {
        this.doctor_id = resp.doctor_id;
      }
    });

    // 📊 EJECUTAMOS LA CARGA DE LA GRILLA
    
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

  private getTableData(page=1): void {
    this.patientList = [];
    this.serialNumberArray = [];
    this.isLoading = true;

    this.patientService.listPatients(page, this.searchDataValue).subscribe((resp:any)=>{
      // console.log(resp);

      this.totalDataPatient = resp.total;
      this.patientList = resp.patients.data;
      this.patient_id = resp.patients.id;
      // this.getTableDataGeneral();
      this.dataSource = new MatTableDataSource<any>(this.patientList);
      this.calculateTotalPages(this.totalDataPatient, this.pageSize);
       this.isLoading = false;
    })
  }

 

  getTableDataGeneral(){
    this.patientList = [];
    this.serialNumberArray = [];
    
    this.patient_generals.map((res: any, index: number) => {
      const serialNumber = index + 1;
      if (index >= this.skip && serialNumber <= this.limit) {
       
        this.patientList.push(res);
        this.serialNumberArray.push(serialNumber);
      }
    });
    this.dataSource = new MatTableDataSource<any>(this.patientList);
    this.calculateTotalPages(this.totalDataPatient, this.pageSize);
  }
  selectUser(staff:any){
    this.patient_selected = staff;
  }

  deletePatient(){
    this.patientService.deletePatient(this.patient_selected.id).subscribe((resp:any)=>{
      // console.log(resp);

      if(resp.message == 403){
        this.text_validation = resp.message_text;
      }else{

        const INDEX = this.patientList.findIndex((item:any)=> item.id == this.patient_selected.id);
      if(INDEX !=-1){
        this.patientList.splice(INDEX,1);

        $('#delete_patient').hide();
        $("#delete_patient").removeClass("show");
        $(".modal-backdrop").remove();
        $("body").removeClass();
        $("body").removeAttr("style");
        this.patient_selected = null;
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
    const data = this.patientList.slice();

    if (!sort.active || sort.direction === '') {
      this.patientList = data;
    } else {
      this.patientList = data.sort((a, b) => {
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
    const worksheet = XLSX.utils.json_to_sheet(this.patientList);

    const workbook = {
      Sheets:{
        'testingSheet': worksheet
      },
      SheetNames:['testingSheet']
    }

    const excelBuffer = XLSX.write(workbook, {bookType:'xlsx', type: 'array'});

    const blobData = new Blob([excelBuffer],{type: EXCEL_TYPE});

    this.fileSaver.save(blobData, "patients_db_appcitasmedicas",)

  }
  csvExport(){
    const CSV_TYPE = 'text/csv';
    const CSV_EXTENSION = '.csv';

    this.getTableDataGeneral();

    //custom code
    const worksheet = XLSX.utils.json_to_sheet(this.patientList);

    const workbook = {
      Sheets:{
        'testingSheet': worksheet
      },
      SheetNames:['testingSheet']
    }

    const excelBuffer = XLSX.write(workbook, {bookType:'csv', type: 'array'});

    const blobData = new Blob([excelBuffer],{type: CSV_TYPE});

    this.fileSaver.save(blobData, "patients_db_appcitasmedicas", CSV_EXTENSION)

  }

  txtExport(){
    const TXT_TYPE = 'text/txt';
    const TXT_EXTENSION = '.txt';

    this.getTableDataGeneral();


    //custom code
    const worksheet = XLSX.utils.json_to_sheet(this.patientList);

    const workbook = {
      Sheets:{
        'testingSheet': worksheet
      },
      SheetNames:['testingSheet']
    }

    const excelBuffer = XLSX.write(workbook, {bookType:'xlsx', type: 'array'});

    const blobData = new Blob([excelBuffer],{type: TXT_TYPE});

    this.fileSaver.save(blobData, "patients_db_appcitasmedicas", TXT_EXTENSION)

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


}
