import { Component } from '@angular/core';
import { routes } from 'src/app/shared/routes/routes';
import { StaffService } from '../service/staff.service';
import { Router } from '@angular/router';
import { DoctorService } from '../../doctors/service/doctor.service';
import { RolesService } from '../../roles/service/roles.service';

@Component({
  selector: 'app-add-staff-n',
  templateUrl: './add-staff-n.component.html',
  styleUrls: ['./add-staff-n.component.scss']
})
export class AddStaffNComponent {
  public routes = routes;
  public selectedValue!: string;

  public name = '';
  public surname = '';
  public mobile = '';
  public email = '';
  public password = '';
  public password_confirmation = '';
  public birth_date = '';
  public gender = 1;
  public education = '';
  public designation = '';
  public address = '';

  public roles:any = [];
  public FILE_AVATAR:any;
  public IMAGE_PREVISUALIZA:any = 'assets/img/user-06.jpg';

  valid_form = false;
  public text_success = '';
  public text_validation = '';

  public addClass = false;

  user : any;
  constructor(
    public staffService:StaffService,
    public router: Router,
    public doctorService: DoctorService,
    public roleService: RolesService,

  ){

  }

  ngOnInit(): void {
    this.doctorService.closeMenuSidebar();
    window.scrollTo(0, 0);
    this.getRoles();
    this.user = this.roleService.authService.user;
  }

  getRoles(){
    this.staffService.listConfig().subscribe((resp:any)=>{
      // console.log(resp);
      this.roles = resp.roles;
    })
  }

  loadFile($event:any){
    if($event.target.files[0].type.indexOf("image")){
      this.text_validation = 'Solamente pueden ser archivos de tipo imagen';
      return;
    }
    this.text_validation = '';
    this.FILE_AVATAR = $event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(this.FILE_AVATAR);
    reader.onloadend = ()=> this.IMAGE_PREVISUALIZA = reader.result;
  }

  save(){
    this.text_validation = null;
    if(!this.name||!this.email ||!this.surname ){
      this.text_validation = 'Los campos con * son obligatorios';
      return;
    }

    if(this.password != this.password_confirmation  ){
      this.text_validation = 'Las contraseña debe ser igual';
      return;
    }

    this.valid_form = false;
    // console.log(this.selectedValue);
    const formData = new FormData();

    formData.append('name', this.name);
    formData.append('surname', this.surname);
    formData.append('mobile', this.mobile);
    formData.append('email', this.email);
    formData.append('password', this.password);
    formData.append('birth_date', this.birth_date);
    formData.append('gender', this.gender+'');
    formData.append('education', this.education);
    formData.append('designation', this.designation);
    formData.append('address', this.address);
    formData.append('role_id', this.selectedValue);
    formData.append('imagen', this.FILE_AVATAR);

    this.text_success = '';
    this.text_validation = null;

    this.staffService.createUser(formData).subscribe((resp:any)=>{
      // console.log(resp);
      if(resp.message == 403){
        this.text_validation = resp.message_text;
      }else{

        this.name = '';
        this.surname = '';
        this.mobile = '';
        this.email = '';
        this.password = '';
        this.birth_date = '';
        this.education = '';
        this.designation = '';
        this.address = '';
        this.selectedValue = '';
        // this.text_success = 'El Usuario se ha editado correctamente';
        this.router.navigate(['/staffs/list']);
      }
    })


  }

  
  
}
