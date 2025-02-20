import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EspecialidadFilterPipe } from './especialidad-filter.pipe';
import { RolesFilterPipe } from './roles-filter.pipe';
import { ArrayFindPipe } from './array-find.pipe';
import { ArrayFilterPipe } from './array-filter.pipe';
import { AdminFilterPipe } from './admin-filter.pipe';



@NgModule({
  declarations: [
    EspecialidadFilterPipe,
    RolesFilterPipe,
    ArrayFindPipe,
    ArrayFilterPipe,
    AdminFilterPipe,

  ],
  exports: [
    EspecialidadFilterPipe,
    RolesFilterPipe,
    ArrayFindPipe,
    ArrayFilterPipe,
    AdminFilterPipe,

  ],
  imports: [
    CommonModule
  ]
})
export class PipesModule { }
