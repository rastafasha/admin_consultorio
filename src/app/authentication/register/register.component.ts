import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StaffService } from 'src/app/services/staff.service';
import { AuthService } from 'src/app/shared/auth/auth.service';
import { routes } from 'src/app/shared/routes/routes';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  public routes = routes;
  public CustomControler!: number | string | boolean ;
  public passwordClass  = false;
  public confirmPasswordClass  = false
  public isValidConfirmPassword = false;
  public acepta = false;
  public isLoading = false;
  public text_validation = '';
  public text_success = '';
  public text_error = '';

  currentStep = 1;

  form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    surname: new FormControl('', [Validators.required]),
    mobile: new FormControl('', [Validators.required]),
    n_doc: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    confirmPassword: new FormControl('', [Validators.required]),
    acepta: new FormControl(false, [Validators.requiredTrue]),
    role_id: new FormControl('9'),
  });

  get f() {
    return this.form.controls;
  }

  step1Valid(): boolean {
    const step1Controls = ['name', 'surname', 'n_doc', 'mobile'];
    return step1Controls.every(control => this.form.get(control)?.valid);
  }

  nextStep() {
    const step1Controls = ['name', 'surname', 'n_doc', 'mobile'];
    step1Controls.forEach(control => {
      this.form.get(control)?.markAsTouched();
    });
    if (this.step1Valid()) {
      this.currentStep = 2;
    }
  }

  prevStep() {
    this.currentStep = 1;
  }

  constructor(
    private router:Router,
    private auth: AuthService,
    private staffService: StaffService
  ) { }

  
  submit() {
    this.isLoading = true;
    if (this.form.value.password === this.form.value.confirmPassword) {
      this.isValidConfirmPassword = true;
      this.acepta = true;

      const formData = new FormData();
      formData.append('name', this.form.value.name || '');
      formData.append('surname', this.form.value.surname || '');
      formData.append('mobile', this.form.value.mobile || '');
      formData.append('email', this.form.value.email || '');
      formData.append('password', this.form.value.password || '');
      formData.append('n_doc', this.form.value.n_doc || '');
      formData.append('acepta', this.form.value.acepta ? '1' : '0');
      formData.append('role_id', '9');
      // formData.append('speciality_id', this.speciality_id);

      this.staffService.createUser(formData).subscribe((resp:any)=>{
        console.log(resp);
        // this.router.navigate([routes.doctorProfile]);

        if(resp.message == 403){
          this.isLoading = false;
          // Swal.fire('Actualizado', this.text_validation, 'success');
          this.text_validation = resp.message_text;
          Swal.fire({
            position: "top-end",
            icon: "warning",
            title: this.text_validation,
            showConfirmButton: false,
            timer: 1500
          });
        }else{
          // Swal.fire('Actualizado', this.text_success, 'success' );
          // this.text_success = 'El usuario ha sido registrado correctamente';
           this.isLoading = false;
          this.text_success = 'El usuario ha sido registrado correctamente';
          Swal.fire({
            position: "top-end",
            icon: "success",
            title: this.text_success,
            showConfirmButton: false,
            timer: 1500
          });
          this.router.navigate([routes.login]);
        }
        }
      )
      
    } else {
      this.isValidConfirmPassword = false;
      // this.acepta = false;
    }
  }


  passwordFunc(){
    this.passwordClass = !this.passwordClass
  }
  confirmPasswordFunc(){
    this.confirmPasswordClass = !this.confirmPasswordClass
  }

 
}
