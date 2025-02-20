import { Component } from '@angular/core';
import { FileSaverService } from 'ngx-filesaver';
import { DoctorService } from 'src/app/medical/doctors/service/doctor.service';
import { RolesService } from 'src/app/medical/roles/service/roles.service';
import { SpecialitieService } from 'src/app/medical/specialitie/service/specialitie.service';

@Component({
  selector: 'app-export-lists',
  templateUrl: './export-lists.component.html',
  styleUrls: ['./export-lists.component.scss']
})
export class ExportListsComponent {

  user:any;
    constructor(
      public doctorService: DoctorService,
      public roleService: RolesService,
    ){
  
    }
  ngOnInit() {
    window.scrollTo(0, 0);
    this.doctorService.closeMenuSidebar();
    this.user = this.roleService.authService.user;
  }
  
  isPermission(permission:string){
    if(this.user.roles.includes('SUPERADMIN')){
      return true;
    }
    if(this.user.permissions.includes(permission)){
      return true;
    }
    return false;
  }

}
