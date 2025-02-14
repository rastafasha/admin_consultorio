import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'arrayFind',
})
export class ArrayFindPipe implements PipeTransform {
  transform<T>(items: T[], field: keyof T, value: unknown): T {
    if (!items || !field || value === undefined || value === null) {
      return null;
    }
    return items.find((item) => item[field] === value);
  }
}
