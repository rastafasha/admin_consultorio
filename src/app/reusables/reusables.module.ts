import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackButtnComponent } from './backButtn/backButtn.component';
import { SkeletonLoaderComponent } from './skeleton-loader/skeleton-loader.component';
import { BreadcumsComponent } from './breadcums/breadcums.component';
import { LoaderAnimComponent } from './loader-anim/loader-anim.component';
import { ExportListsComponent } from './export-lists/export-lists.component';
import { BreadcumDoctorDashboardComponent } from './breadcum-doctor-dashboard/breadcum-doctor-dashboard.component';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [
    BackButtnComponent,
    SkeletonLoaderComponent,
    BreadcumsComponent,
    LoaderAnimComponent,
    ExportListsComponent,
    BreadcumDoctorDashboardComponent
  ],
  exports: [
    BackButtnComponent,
    SkeletonLoaderComponent,
    BreadcumsComponent,
    LoaderAnimComponent,
    ExportListsComponent,
    BreadcumDoctorDashboardComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ]
})
export class ReusablesModule { }
