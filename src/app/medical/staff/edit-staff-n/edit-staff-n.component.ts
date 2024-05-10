import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { routes } from 'src/app/shared/routes/routes';
import { StaffService } from '../service/staff.service';

@Component({
  selector: 'app-edit-staff-n',
  templateUrl: './edit-staff-n.component.html',
  styleUrls: ['./edit-staff-n.component.scss']
})
export class EditStaffNComponent {
  public routes = routes;
  public selectedValue !: string  ;

  public name: string = '';
  public surname: string = '';
  public mobile: any;ß
  public email: string = '';
  public password: string = '';
  public password_confirmation: string = '';
  public birth_date: string = '';
  public gender: number = 1;
  public education: string = '';
  public designation: string = '';
  public address: string = '';

  public roles:any = [];
  public FILE_AVATAR:any;
  public IMAGE_PREVISUALIZA:any = 'assets/img/user-06.jpg';

  valid_form:boolean = false;
  public text_success:string = '';
  public text_validation:string = '';
  
  user_id:any;
  staff_selected:any;

  constructor(
    public staffService:StaffService,
    public router: Router,
    public ativatedRoute: ActivatedRoute,
  ){

  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.getRoles();
    this.ativatedRoute.params.subscribe((resp:any)=>{
      this.user_id = resp.id;
     })
     this.showUser();
  }
  showUser(){
    this.staffService.getUser(this.user_id).subscribe((resp:any)=>{
      // console.log(resp);
      this.staff_selected = resp.user;

      this.name = this.staff_selected.name;
      this.selectedValue = this.staff_selected.roles.id;
      this.surname = this.staff_selected.surname;
        this.mobile = this.staff_selected.mobile;
        this.email = this.staff_selected.email;
        this.birth_date = new Date(this.staff_selected.birth_date).toISOString();
        this.education = this.staff_selected.education;
        this.designation = this.staff_selected.designation;
        this.gender = this.staff_selected.gender;
        this.address = this.staff_selected.address;
        this.IMAGE_PREVISUALIZA = this.staff_selected.avatar;
    })
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
    let reader = new FileReader();
    reader.readAsDataURL(this.FILE_AVATAR);
    reader.onloadend = ()=> this.IMAGE_PREVISUALIZA = reader.result;
  }

  save(){
    this.text_validation = null;
    if(!this.name||!this.email ||!this.surname ){
      this.text_validation = 'Los campos con * son obligatorios';
      return;
    }

    if(this.password ){
      if(this.password != this.password_confirmation  ){
        this.text_validation = 'Las contraseña debe ser igual';
        return;
      }
    }

    this.valid_form = false;
    console.log(this.selectedValue);
    let formData = new FormData();

    formData.append('name', this.name);
    formData.append('surname', this.surname);
    formData.append('mobile', this.mobile);
    formData.append('email', this.email);
    formData.append('birth_date', this.birth_date);
    formData.append('gender', this.gender+'');
    // formData.append('id', this.user_id);
    
    
    if(this.selectedValue ){
      formData.append('role_id', this.selectedValue);
    }
    if(this.education ){
      formData.append('education', this.education);
    }
    if(this.address ){
      formData.append('address', this.address);
    }
    if(this.designation ){
      formData.append('designation', this.designation);
    }
    
    if(this.password ){
      formData.append('password', this.password);
    }
    this.FILE_AVATAR  = this.IMAGE_PREVISUALIZA;
    if(this.FILE_AVATAR ){
      formData.append('imagen', this.FILE_AVATAR);
    }

    this.text_success = '';
    this.text_validation = null;

    this.staffService.editUser(formData, this.user_id ).subscribe((resp:any)=>{
      // console.log(resp);
      if(resp.message == 403){
        this.text_validation = resp.message_text;
      }else{
        
        this.text_success = 'El Usuario se ha editado correctamente';
      }
    })


  }
}
