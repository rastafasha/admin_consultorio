import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'rolesFilter',
    standalone: false
})
export class RolesFilterPipe implements PipeTransform {

  transform<T extends { name: string }>(roles: T[]): T[] {
    return roles.filter((role) => 
        role.name === 'SUPERADMIN' || 
        role.name === 'DOCTOR' 
    );
  }

}
