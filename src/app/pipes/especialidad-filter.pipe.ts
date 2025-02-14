import { Pipe, PipeTransform } from '@angular/core';


interface EspecialidadFilter {
  speciality_id: number;
}

@Pipe({
  name: 'especialidadFilter'
})
export class EspecialidadFilterPipe implements PipeTransform {

  transform<T extends { id: number }>(
    specialities: T[],
    filter: EspecialidadFilter
  ): T[] {
    if (!filter) return specialities;
    return specialities.filter((speciality) => speciality.id === filter.speciality_id);
  }
}
