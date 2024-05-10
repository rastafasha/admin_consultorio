import { Component } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
import {DataService} from 'src/app/shared/data/data.service';
import { RolesService } from '../service/roles.service';
import { Router } from '@angular/router';
import { DoctorService } from '../../doctors/service/doctor.service';
@Component({
  selector: 'app-add-role-user',
  templateUrl: './add-role-user.component.html',
  styleUrls: ['./add-role-user.component.scss']
})
export class AddRoleUserComponent  {
  public routes = routes;

  sideBar:any = [];
  name:string = '';
  permissions:any = [];
  valid_form:boolean = false;
  valid_form_success:boolean = false;
  text_validation:any = null;

  constructor(
    public dataService: DataService,
    public roleService: RolesService,
    public doctorService: DoctorService,
    public router: Router,
  ){

  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.doctorService.closeMenuSidebar();
   this.sideBar = this.dataService.sideBar[0].menu;
  }

  addPermission(subMenu:any){
    if(subMenu.permision){
      let INDEX = this.permissions.findIndex((item:any)=>item == subMenu.permision);
      if(INDEX != -1){
        this.permissions.splice(INDEX,1);
      }else{
        this.permissions.push(subMenu.permision);
      }
      console.log(this.permissions);
        
    }
  }

  save(){
    this.valid_form = false;
    

    if(!this.name || this.permissions.length == 0){
      this.valid_form = true;
      return;
    }
    let data = {
      name:this.name,
      permissions: this.permissions,
    }
    this.valid_form_success = false;
    this.text_validation = null;

    this.roleService.storeRole(data).subscribe((resp:any)=>{
      // console.log(resp);
      if(resp.message == 403){
        this.text_validation = resp.message_text;
      }else{

        this.name = '';
        this.permissions = [];
        this.valid_form_success = true;
        //limpia los checks
        let SIDE_BAR = this.sideBar;
        this.sideBar = [];
        setTimeout(() => {
          this.sideBar = SIDE_BAR;
        }, 50);
        //limpia los checks
        this.router.navigate(['/roles/list']);
      }
    })
  }
  
}
