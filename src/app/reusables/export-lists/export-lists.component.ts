import { Component, OnInit, Input, inject } from '@angular/core';
import { DoctorService } from '../../services/doctor.service';
import { RolesService } from '../../services/roles.service';
import { FileSaverService } from 'ngx-filesaver';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'; // 🚀 Requiere el npm install jspdf-autotable ejecutado en consola

@Component({
    selector: 'app-export-lists',
    templateUrl: './export-lists.component.html',
    styleUrls: ['./export-lists.component.scss'],
    standalone: false
})
export class ExportListsComponent implements OnInit {

  // 📥 ENTRADAS DINÁMICAS MAESTRAS
  @Input() dataToExport: any[] = [];         
  @Input() filenamePrefix: string = 'export'; 
  @Input() exportPermission: string = '';     

  user: any;

  // Inyección moderna de dependencias mediante inject()
  private doctorService = inject(DoctorService);
  private roleService = inject(RolesService);
  private fileSaver = inject(FileSaverService);

  ngOnInit() {
    this.user = this.roleService.authService.user;
  }
  
  isPermission(permission: string): boolean {
    if (!this.user) return false;
    if (this.user.roles?.includes('SUPERADMIN')) {
      return true;
    }
    if (!permission) return true;

    return this.user.permissions?.includes(permission) || false;
  }

  excelExport() {
    if (!this.dataToExport || this.dataToExport.length === 0) return;

    const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=UTF-8';
    const worksheet = XLSX.utils.json_to_sheet(this.dataToExport);

    const workbook = {
      Sheets: { 'Sheet1': worksheet },
      SheetNames: ['Sheet1']
    };

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blobData = new Blob([excelBuffer], { type: EXCEL_TYPE });
    
    this.fileSaver.save(blobData, `${this.filenamePrefix}_db_klyntic_${Date.now()}`);
  }

  csvExport() {
    if (!this.dataToExport || this.dataToExport.length === 0) return;

    const CSV_TYPE = 'text/csv;charset=utf-8;';
    const worksheet = XLSX.utils.json_to_sheet(this.dataToExport);

    // 🚀 CORREGIDO: Declarado explícitamente el objeto workbook para evitar el error de compilación
    const workbookObj = {
      Sheets: { 'Sheet1': worksheet },
      SheetNames: ['Sheet1']
    };

    const excelBuffer = XLSX.write(workbookObj, { bookType: 'csv', type: 'array' });
    const blobData = new Blob([excelBuffer], { type: CSV_TYPE });

    this.fileSaver.save(blobData, `${this.filenamePrefix}_db_klyntic_${Date.now()}`, '.csv');
  }

  txtExport() {
    if (!this.dataToExport || this.dataToExport.length === 0) return;

    const TXT_TYPE = 'text/plain;charset=utf-8;';
    const worksheet = XLSX.utils.json_to_sheet(this.dataToExport);

    // 🚀 CORREGIDO: Declarado explícitamente el objeto workbook para evitar el error de compilación
    const workbookObj = {
      Sheets: { 'Sheet1': worksheet },
      SheetNames: ['Sheet1']
    };

    const excelBuffer = XLSX.write(workbookObj, { bookType: 'txt', type: 'array' });
    const blobData = new Blob([excelBuffer], { type: TXT_TYPE });

    this.fileSaver.save(blobData, `${this.filenamePrefix}_db_klyntic_${Date.now()}`, '.txt');
  }

  /**
   * 📑 GENERADOR VECTORIAL SEGURO DE PDF
   */
  pdfExport() {
    if (!this.dataToExport || this.dataToExport.length === 0) return;

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text(`Reporte Global Administrativo - ${this.filenamePrefix.toUpperCase()}`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Fecha Emisión: ${new Date().toLocaleDateString('es-VE')} | Entorno Seguro Klyntic Enterprise`, 14, 22);

    // Extraemos las cabeceras basadas en las llaves del primer objeto del arreglo
    const headers = Object.keys(this.dataToExport[0]).map(key => key.toUpperCase());
    
    const rows = this.dataToExport.map(item => 
      Object.values(item).map(val => {
        if (typeof val === 'object' && val !== null) {
          return (val as any).name || (val as any).full_name || JSON.stringify(val);
        }
        return val === null ? '' : String(val);
      })
    );

    // 🚀 CORREGIDO: Añadido color estético hexadecimal para headStyles (fillColor) y textColor
    autoTable(doc, {
      startY: 28,
      head: [headers],
      body: rows,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: '#0d6efd', textColor: '#ffffff' }, // Azul Bootstrap institucional elegante
      theme: 'striped'
    });

    doc.save(`${this.filenamePrefix}_reporte_${Date.now()}.pdf`);
  }
}