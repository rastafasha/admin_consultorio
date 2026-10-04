import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { routes } from '../../shared/routes/routes';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { ConsultorioCRM, ClinicaService } from '../../services/clinica.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: false
})
export class LoginComponent implements OnInit {
  public routes = routes;
  public passwordClass = false;
 public ERROR = false;
 public isLoading = false;
 public user:any;
 public roles:any = [] ;

// 🏢 VARIABLES ENTERPRISE: Almacena los datos del CRM de Node.js [5]
  public clinicaSelected: ConsultorioCRM | null = null;
  private clinicaSubscription!: Subscription;

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
    private clinicaService : ClinicaService,
    ) {
     
    }

  ngOnInit(): void {
    this.getLocalStorage();
    this.sincronizarContextoClinica();
  }

  /**
     * 🏛️ Consume la API de Node.js a través de la caché reactiva de ClinicaService [5]
     */
    sincronizarContextoClinica(): void {
      
      
      // 1. Extraemos el subdominio/slug (ej: 'clinica-prueba') [5]
      const slug = this.clinicaService.obtenerSlugDeUrl();
  
      // 2. Le pegamos a la caché reactiva conectada a Node.js [5]
      this.clinicaSubscription = this.clinicaService.getClinicaBySlugCached(slug)
        .subscribe({
          next: (clinica: ConsultorioCRM | null) => {
            if (clinica) {
              this.clinicaSelected = clinica;
              console.log(`🏢 [Dashboard CRM] Conectado al entorno corporativo: ${clinica.name}`);
              
              // 🎨 Inyectamos los colores de la clínica en la cabecera del DOM en caliente [5]
              this.clinicaService.aplicarEstilosDinamicos(clinica.css_personalizado);
            }
            
          },
          error: (err) => {
            console.error('❌ Error sincronizando el dashboard con MongoDB Atlas:', err);
            
          }
        });
    }
  
   
  
    ngOnDestroy(): void {
      // 🧹 Apagamos la suscripción para evitar fugas de memoria en MAMP
      if (this.clinicaSubscription) {
        this.clinicaSubscription.unsubscribe();
      }
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
    this.isLoading = true;
    if (this.form.valid) {
      this.ERROR = false;
      this.auth.login(this.form.value.email ? this.form.value.email : '' ,this.form.value.password ? this.form.value.password: '')
      .subscribe((resp:any) => {
        if(resp === true){
          // EL LOGIN ES EXITOSO
          this.isLoading = false;
          this.getLocalStorage();
          setTimeout(() => {
            // this.router.navigate([routes.adminDashboard]);
          }, 50);
          
        }else{
          this.isLoading = false;
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
      if(this.user.roles == 'RECEPCION' ){
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
