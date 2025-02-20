import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackButtnComponent } from './backButtn/backButtn.component';
import { SkeletonLoaderComponent } from './skeleton-loader/skeleton-loader.component';
import { BreadcumsComponent } from './breadcums/breadcums.component';
import { LoaderAnimComponent } from './loader-anim/loader-anim.component';
import { ExportListsComponent } from './export-lists/export-lists.component';


@NgModule({
  declarations: [
    BackButtnComponent,
    SkeletonLoaderComponent,
    BreadcumsComponent,
    LoaderAnimComponent,
    ExportListsComponent
  ],
  exports: [
    BackButtnComponent,
    SkeletonLoaderComponent,
    BreadcumsComponent,
    LoaderAnimComponent,
    ExportListsComponent
  ],
  imports: [
    CommonModule,
  ]
})
export class ReusablesModule { }
