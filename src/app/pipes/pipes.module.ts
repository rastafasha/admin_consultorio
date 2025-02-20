import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ArrayFilterPipe } from './array-filter.pipe';
import { CeilPipe } from './ceil.pipe';
import { FloorPipe } from './floor.pipe';
import { LocationFilterPipe } from './location-filter.pipe';
import { MaxPipe } from './max.pipe';
import { MinPipe } from './min.pipe';
import { GetPrizeCptNotePipe } from './prize-cpt.pipe';
import { RoleFilterPipe } from './roles-filter.pipe';
import { SecureResourceUrlPipe } from './secure-resource-url.pipe';
import { TransformToDatePipe } from './transform-to-date.pipe';
import { ArrayFindPipe } from './array-find.pipe';
import { RemoveStringPipe } from './remove-string.pipe';
import { RbtFilterPipe } from './rbt-filter.pipe';
import { TransformToHourPipe } from './transform-to-hours.pipe';
import { FilterDisponibilidadCptPipe } from './filter-disponibilidad-cpt.pipe';
import { ClearTextPipe } from './clear-text.pipe';
import { CellRenderPipe } from './cell-render.pipe';
import { AdminFilterPipe } from './admin-filter.pipe';
import { HeadRenderPipe } from './head-render.pipe';

const components = [
  ArrayFilterPipe,
  ArrayFindPipe,
  SecureResourceUrlPipe,
  TransformToDatePipe,
  RoleFilterPipe,
  LocationFilterPipe,
  GetPrizeCptNotePipe,
  MinPipe,
  MaxPipe,
  CeilPipe,
  FloorPipe,
  RemoveStringPipe,
  RbtFilterPipe,
  TransformToHourPipe,
  FilterDisponibilidadCptPipe,
  ClearTextPipe,
  CellRenderPipe,
  HeadRenderPipe,
  AdminFilterPipe
];
@NgModule({
  declarations: [...components],
  exports: [...components],
  imports: [CommonModule],
})
export class PipesModule {}
