import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AcompanantesComponent } from './acompanantes/acompanantes.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AntecedentesComponent } from './antecedentes/antecedentes.component';
import { HistorialEnfermedadComponent } from './historial-enfermedad/historial-enfermedad.component';
import { SignosVitalesComponent } from './signos-vitales/signos-vitales.component';
import { VacunasComponent } from './vacunas/vacunas.component';
import { ExamenFisicoComponent } from './examen-fisico/examen-fisico.component';
import { ReporteLaboratorioComponent } from './reporte-laboratorio/reporte-laboratorio.component';
import { DiagnosticoComponent } from './diagnostico/diagnostico.component';
import { TratamientoComponent } from './tratamiento/tratamiento.component';
import { EvolucionComponent } from './evolucion/evolucion.component';
import { MotivoConsultaComponent } from './motivo-consulta/motivo-consulta.component';
import { EnfermedadActualComponent } from './enfermedad-actual/enfermedad-actual.component';



@NgModule({
  declarations: [
    AcompanantesComponent,
    AntecedentesComponent,
    HistorialEnfermedadComponent,
    SignosVitalesComponent,
    VacunasComponent,
    ExamenFisicoComponent,
    ReporteLaboratorioComponent,
    DiagnosticoComponent,
    TratamientoComponent,
    EvolucionComponent,
    MotivoConsultaComponent,
    EnfermedadActualComponent
  ],
  exports: [
    AcompanantesComponent,
    AntecedentesComponent,
    HistorialEnfermedadComponent,
    SignosVitalesComponent,
    VacunasComponent,
    ExamenFisicoComponent,
    ReporteLaboratorioComponent,
    DiagnosticoComponent,
    TratamientoComponent,
    EvolucionComponent,
    MotivoConsultaComponent,
    EnfermedadActualComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule
  ]
})
export class PatientComponentsModule { }
