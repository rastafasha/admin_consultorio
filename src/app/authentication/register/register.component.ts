import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DoctorService } from 'src/app/medical/doctors/service/doctor.service';
import { StaffService } from 'src/app/medical/staff/service/staff.service';
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
  public text_validation = '';
  public text_success = '';
  public text_error = '';

  form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    surname: new FormControl('', [Validators.required]),
    mobile: new FormControl('', [Validators.required]),
    n_doc: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    confirmPassword: new FormControl('', [Validators.required]),
  });

  get f() {
    return this.form.controls;
  }

  constructor(
    private router:Router,
    private auth: AuthService,
    private staffService: StaffService
  ) { }

  
  
  // eslint-disable-next-line no-debugger
  submit() {
    if (this.form.value.password === this.form.value.confirmPassword) {
      this.isValidConfirmPassword = true;

      const formData = new FormData();
      formData.append('name', this.form.value.name);
      formData.append('surname', this.form.value.surname);
      formData.append('mobile', this.form.value.mobile);
      formData.append('email', this.form.value.email);
      formData.append('password', this.form.value.password);
      formData.append('n_doc', this.form.value.n_doc);
      formData.append('role_id', '9');
      // formData.append('speciality_id', this.speciality_id);

      this.staffService.createUser(formData).subscribe((resp:any)=>{
        console.log(resp);
        // this.router.navigate([routes.doctorProfile]);

        if(resp.message == 403){
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
    }
  }


  passwordFunc(){
    this.passwordClass = !this.passwordClass
  }
  confirmPasswordFunc(){
    this.confirmPasswordClass = !this.confirmPasswordClass
  }
}
