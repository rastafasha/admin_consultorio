import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'adminFilter',
})
export class AdminFilterPipe implements PipeTransform {
  constructor() {
    //
  }
  transform<T extends { name: string }>(roles: T[]): T[] {
    return roles.filter((role) => 
        role.name === 'MANAGER' || 
        role.name === 'BCBA' || 
        role.name === 'RBT'
    );
  }
}
