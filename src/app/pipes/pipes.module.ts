import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EspecialidadFilterPipe } from './especialidad-filter.pipe';
import { RolesFilterPipe } from './roles-filter.pipe';
import { ArrayFindPipe } from './array-find.pipe';
import { ArrayFilterPipe } from './array-filter.pipe';
import { AdminFilterPipe } from './admin-filter.pipe';
import { SuperAdminFilterPipe } from './superadmin-filter.pipe';
import { ImagenPipe } from './imagen.pipe';



@NgModule({
  declarations: [
    EspecialidadFilterPipe,
    RolesFilterPipe,
    ArrayFindPipe,
    ArrayFilterPipe,
    AdminFilterPipe,
    SuperAdminFilterPipe,
    ImagenPipe

  ],
  exports: [
    EspecialidadFilterPipe,
    RolesFilterPipe,
    ArrayFindPipe,
    ArrayFilterPipe,
    AdminFilterPipe,
    SuperAdminFilterPipe,
    ImagenPipe

  ],
  imports: [
    CommonModule
  ]
})
export class PipesModule { }
