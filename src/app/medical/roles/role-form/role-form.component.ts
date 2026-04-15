import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { routes } from 'src/app/shared/routes/routes';
import { DataService } from 'src/app/shared/data/data.service';
import { RolesService } from '../../../services/roles.service';
import { DoctorService } from '../../../services/doctor.service';

@Component({
    selector: 'app-role-form',
    templateUrl: './role-form.component.html',
    styleUrls: ['./role-form.component.scss'],
    standalone: false
})
export class RoleFormComponent implements OnInit {
  public routes = routes;
  public roleForm: FormGroup;
  public isEditMode = false;
  public roleId: number | null = null;

  public sideBar: any[] = [];
  public permissions: string[] = [];

  public valid_form_success = false;
  public text_validation = '';

  constructor(
    private fb: FormBuilder,
    public dataService: DataService,
    public roleService: RolesService,
    public doctorService: DoctorService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.roleForm = this.fb.group({
      name: ['', Validators.required],
      permissions: this.fb.array([])
    });
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.doctorService.closeMenuSidebar();
    this.sideBar = this.dataService.sideBar[0].menu;
    this.roleId = +this.activatedRoute.snapshot.paramMap.get('id')!;
    if (this.roleId) {
      this.isEditMode = true;
      this.loadRole();
    }
  }

  get permissionsArray(): FormArray {
    return this.roleForm.get('permissions') as FormArray;
  }

  loadRole(): void {
    this.roleService.getRole(this.roleId!).subscribe((resp: any) => {
      this.roleForm.patchValue({
        name: resp.name
      });
      this.permissions = resp.permision_pluck || [];
      this.permissions.forEach(perm => {
        this.addPermissionControl(perm);
      });
    });
  }

  addPermissionControl(perm: string): void {
    const permissionsArray = this.permissionsArray;
    permissionsArray.push(new FormControl(perm));
  }

  togglePermission(permision: string, index: number): void {
    const currentIndex = this.permissions.indexOf(permision); if (currentIndex > -1) { this.permissions.splice(currentIndex, 1); }
    else { this.permissions.push(permision); }
  }   // Update FormArray    this.permissionsArray.clear();    this.permissions.forEach((p: string) => this.permissionsArray.push(new FormControl(p)));  }

  save(): void {
    if (this.roleForm.invalid ) {
      // this.text_validation = 'Nombre y al menos un permiso requeridos';
      return;
    }

    const data = {
      name: this.roleForm.get('name')!.value,
      permissions: this.permissions
    };

    const observable = this.isEditMode
      ? this.roleService.editRole(data, this.roleId!)
      : this.roleService.storeRole(data);

    observable.subscribe((resp: any) => {
      if (resp.message === 403) {
        this.text_validation = resp.message_text;
      } else {
        this.valid_form_success = true;
        this.roleForm.reset();
        this.permissions = [];
        this.permissionsArray.clear();
        this.router.navigate(['/roles/list']);
      }
    });
  }

  get title(): string {
    return this.isEditMode ? `Editar Rol` : 'Crear Rol';
  }
}
