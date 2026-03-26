import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { routes } from 'src/app/shared/routes/routes';
import { StaffService } from '../../../services/staff.service';
import { DoctorService } from '../../../services/doctor.service';
import { RolesService } from '../../../services/roles.service';
import { User } from 'src/app/models/user.model';

declare let $: any;

@Component({
  selector: 'app-staff-n',
  templateUrl: './staff-n.component.html',
  styleUrls: ['./staff-n.component.scss']
})
export class StaffNComponent implements OnInit {
  public routes = routes;
  public staffForm: FormGroup;
  public titlePage = 'Agregar Personal';
  public isEditing = false;
  public user_id: number | null = null;
  public staff_selected: any = null;
  public roles: any[] = [];
  public user: any;
  public FILE_AVATAR: any;
  public IMAGE_PREVISUALIZA = 'assets/img/user-06.jpg';
  public text_success = '';
  public text_validation = '';

  constructor(
    private fb: FormBuilder,
    public staffService: StaffService,
    public router: Router,
    public activatedRoute: ActivatedRoute,
    public doctorService: DoctorService,
    public roleService: RolesService
  ) {
    this.staffForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      mobile: [''],
      email: ['', [Validators.required, Validators.email]],
      birth_date: ['', Validators.required],
      gender: [1, Validators.required],
      education: [''],
      designation: [''],
      address: [''],
      role_id: ['', Validators.required],
      password: ['', this.isEditing ? [] : [Validators.required, Validators.minLength(6)]],
      password_confirmation: ['', this.isEditing ? [] : [Validators.required]]
    }, { validators: this.matchPassword });
  }

  ngOnInit(): void {
    this.doctorService.closeMenuSidebar();
    window.scrollTo(0, 0);
    this.getRoles();
    this.user = this.roleService.authService.user;

    this.activatedRoute.params.subscribe((params: any) => {
      if (params.id) {
        this.user_id = +params.id;
        this.loadUser();
      }
    });
  }

  matchPassword(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirm = group.get('password_confirmation')?.value;
    return password === confirm ? null : { mismatch: true };
  }

  getRoles() {
    this.staffService.listConfig().subscribe((resp: any) => {
      this.roles = resp.roles;
    });
  }

  loadUser() {
    this.staffService.getUser(this.user_id!).subscribe((resp: any) => {
      this.staff_selected = resp.user;
      this.staffForm.patchValue({
        name: this.staff_selected.name,
        surname: this.staff_selected.surname,
        mobile: this.staff_selected.mobile,
        email: this.staff_selected.email,
        birth_date: new Date(this.staff_selected.birth_date).toISOString().slice(0, 16),
        gender: this.staff_selected.gender,
        education: this.staff_selected.education,
        designation: this.staff_selected.designation,
        address: this.staff_selected.address,
        role_id: this.staff_selected.roles.id
      });
      this.IMAGE_PREVISUALIZA = this.staff_selected.avatar;
      this.titlePage = `Editar Personal ${this.staff_selected.id}`;
      this.isEditing = true;
      // Rebuild form without password validators for edit
      this.staffForm = this.fb.group({
        name: [this.staff_selected.name, Validators.required],
        surname: [this.staff_selected.surname, Validators.required],
        mobile: [this.staff_selected.mobile],
        email: [this.staff_selected.email, [Validators.required, Validators.email]],
        birth_date: [new Date(this.staff_selected.birth_date).toISOString().slice(0, 16), Validators.required],
        gender: [this.staff_selected.gender, Validators.required],
        education: [this.staff_selected.education],
        designation: [this.staff_selected.designation],
        address: [this.staff_selected.address],
        role_id: [this.staff_selected.roles.id, Validators.required],
        password: [''],
        password_confirmation: ['']
      });
    });
  }

  loadFile($event: any) {
    const file = $event.target.files[0];
    if (file && !file.type.startsWith('image/')) {
      this.text_validation = 'Solamente pueden ser archivos de tipo imagen';
      return;
    }
    this.text_validation = '';
    this.FILE_AVATAR = file;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => this.IMAGE_PREVISUALIZA = reader.result as string;
  }

  save() {
    this.text_validation = '';
    this.text_success = '';

    if (this.staffForm.invalid) {
      this.text_validation = 'Los campos requeridos (*) están vacíos o inválidos';
      return;
    }

    if (!this.isEditing) {
      const password = this.staffForm.get('password')?.value;
      const confirm = this.staffForm.get('password_confirmation')?.value;
      if (password !== confirm) {
        this.text_validation = 'Las contraseñas deben coincidir';
        return;
      }
    }

    const formData = new FormData();
    const formValue = this.staffForm.value;
    formData.append('name', formValue.name);
    formData.append('surname', formValue.surname);
    formData.append('mobile', formValue.mobile);
    formData.append('email', formValue.email);
    formData.append('birth_date', formValue.birth_date);
    formData.append('gender', formValue.gender.toString());
    formData.append('education', formValue.education);
    formData.append('designation', formValue.designation);
    formData.append('address', formValue.address);
    formData.append('role_id', formValue.role_id);

    const password = formValue.password?.trim();
    if (password) {
      formData.append('password', password);
    }

    if (this.FILE_AVATAR) {
      formData.append('imagen', this.FILE_AVATAR);
    }

    if (this.isEditing && this.user_id) {
      this.staffService.editUser(formData, this.user_id).subscribe((resp: any) => {
        this.handleResponse(resp);
      });
    } else {
      this.staffService.createUser(formData).subscribe((resp: any) => {
        this.handleResponse(resp);
      });
    }
  }

  private handleResponse(resp: any) {
    if (resp.message === 403) {
      this.text_validation = resp.message_text;
    } else {
      this.text_success = this.isEditing ? 'El Usuario se ha editado correctamente' : 'El Usuario se ha creado correctamente';
      setTimeout(() => {
        this.router.navigate(['/staffs/list']);
      }, 1500);
    }
  }
}

