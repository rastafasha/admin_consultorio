import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackButtnComponent } from './backButtn/backButtn.component';
import { SkeletonLoaderComponent } from './skeleton-loader/skeleton-loader.component';
import { BreadcumsComponent } from './breadcums/breadcums.component';
import { LoaderAnimComponent } from './loader-anim/loader-anim.component';
import { ExportListsComponent } from './export-lists/export-lists.component';
import { BreadcumDoctorDashboardComponent } from './breadcum-doctor-dashboard/breadcum-doctor-dashboard.component';
import { RouterModule } from '@angular/router';
import { PwaNotifInstallerComponent } from './pwa-notif-installer/pwa-notif-installer.component';


@NgModule({
  declarations: [
    BackButtnComponent,
    SkeletonLoaderComponent,
    BreadcumsComponent,
    LoaderAnimComponent,
    ExportListsComponent,
    BreadcumDoctorDashboardComponent,
    PwaNotifInstallerComponent
  ],
  exports: [
    BackButtnComponent,
    SkeletonLoaderComponent,
    BreadcumsComponent,
    LoaderAnimComponent,
    ExportListsComponent,
    BreadcumDoctorDashboardComponent,
    PwaNotifInstallerComponent
  ],
  imports: [
    CommonModule,
    RouterModule
  ]
})
export class ReusablesModule { }
