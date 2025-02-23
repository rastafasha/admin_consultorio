import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RolesService } from 'src/app/medical/roles/service/roles.service';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { routes } from 'src/app/shared/routes/routes';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  public routes = routes;
  public passwordClass = false;
 public ERROR = false;
 public user:any;
 public roles:any = [] ;


 email = new FormControl();
  password = new FormControl();
  remember = new FormControl();
  errors:any = null;
  loginForm: FormGroup;

  //testing
  // form = new FormGroup({
  //   email: new FormControl('superadmin@superadmin.com', [
  //     Validators.required,
  //     Validators.email,
  //   ]),
  //   password: new FormControl('password', [Validators.required]),
  // });
  form = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email,
    ]),
    password: new FormControl('', [Validators.required]),
    remember: new FormControl(false, [Validators.required]),
  });

  get f() {
    return this.form.controls;
  }

  constructor(
    public auth: AuthService,

    public router:Router,
    private fb: FormBuilder,
    ) {
     
    }

  ngOnInit(): void {
   
    this.getLocalStorage();
    
  }

  getLocalStorage(){
    if(localStorage.getItem('token') && localStorage.getItem('user')){
      const USER = localStorage.getItem('user');
      this.user = JSON.parse(USER ? USER: '');
      this.getuserRol();
      // this.getRemoto();
    }else{
      this.user = null;
    }
 }

 getRemoto(){
  this.auth.getUserRomoto(this.user.id).subscribe((resp:any) => {
    // console.log(resp);
    this.user = resp.user;
  }
  );
 }


  loginFormSubmit() {
    if (this.form.valid) {
      this.ERROR = false;
      this.auth.login(this.form.value.email ? this.form.value.email : '' ,this.form.value.password ? this.form.value.password: '')
      .subscribe((resp:any) => {
        if(resp === true){
          // EL LOGIN ES EXITOSO
          
          setTimeout(() => {
            this.getLocalStorage();
            // this.router.navigate([routes.adminDashboard]);
          }, 50);
        }else{
          // EL LOGIN NO ES EXITOSO
          this.ERROR = true;
        }
      },error => {
        console.log(error);
      })
      ;
    }
  }

    getuserRol(){
      
    
      if(this.user.roles == 'DOCTOR' ){
        this.router.navigate([routes.doctorDashboard]);
      }
      if(this.user.roles == 'SUPERADMIN' ){
        this.router.navigate([routes.adminDashboard]);
      }
      
      if(this.user.roles == 'LABORATORIO' ){
        this.router.navigate([routes.laboratoryList]);
      }
      //roles secundarios
      if(this.user.roles == 'DOCTOR ESPECIALISTA' ){
        this.router.navigate([routes.doctorDashboard]);
      }
      if(this.user.roles == 'DOCTOR ASISTENTE' ){
        this.router.navigate([routes.doctorDashboard]);
      }
      if(this.user.roles == 'CONTADOR' ){
        this.router.navigate([routes.adminDashboard]);
      }
      if(this.user.roles == 'ADMIN' ){
        this.router.navigate([routes.adminDashboard]);
      }
      if(this.user.roles == 'ENFERMERA' ){
        this.router.navigate([routes.doctorDashboard]);
      }
      if(this.user.roles == 'RECEPCIÓN' ){
        this.router.navigate([routes.adminDashboard]);
      }
      if(this.user.roles == 'GUEST' ){
        this.router.navigate([routes.doctorProfile, this.user.id]);
      }
      
   }
 
    getuserPermisos(){
      if(this.user.permissions === 'admin_dashboard'){
        this.router.navigate([routes.adminDashboard]);
      }
      if(this.user.permissions === "doctor_dashboard"){
        this.router.navigate([routes.doctorDashboard]);
      }
      if(this.user.permissions === 'patient_dashboard'){
        this.router.navigate([routes.patientDashboard]);
      }
   }
 
  
  togglePassword() {
    this.passwordClass = !this.passwordClass;
  }
}
