import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { routes } from 'src/app/shared/routes/routes';
import { SpecialitieService } from '../../../services/specialitie.service';
import { DoctorService } from '../../../services/doctor.service';
import { Speciality } from 'src/app/models/speciality.model';

@Component({
    selector: 'app-specialitie-n',
    templateUrl: './specialitie-n.component.html',
    styleUrls: ['./specialitie-n.component.scss'],
    standalone: false
})
export class SpecialitieNComponent implements OnInit {
  public routes = routes;
  public specialitieForm: FormGroup;
  public titlePage = 'Agregar Especialidad';
  public isEditing = false;
  public isLoading = false;
  public specialitie_id: number | null = null;
  public specialitie_selected: Speciality;
  public text_success = '';
  public text_validation = '';

  constructor(
    private fb: FormBuilder,
    public specialitieService: SpecialitieService,
    public router: Router,
    public activatedRoute: ActivatedRoute,
    public doctorService: DoctorService
  ) {
    this.specialitieForm = this.fb.group({
      name: ['', Validators.required],
      state: [1, Validators.required]
    });
  }

  ngOnInit(): void {
    this.doctorService.closeMenuSidebar();
    window.scrollTo(0, 0);

    this.activatedRoute.params.subscribe((params: any) => {
      if (params.id) {
        this.specialitie_id = +params.id;
        this.loadSpecialitie();
      }
    });
  }

  loadSpecialitie() {
    this.isLoading = true;
    this.specialitieService.showSpecialities(this.specialitie_id!).subscribe((resp: any) => {
      this.specialitie_selected = resp;
      this.specialitieForm.patchValue({
        name: this.specialitie_selected.name,
        state: this.specialitie_selected.state
      });
      this.isLoading = false;
      this.titlePage = `Editar Especialidad ${this.specialitie_selected.id}`;
      this.isEditing = true;
    });
  }

  save() {
    this.text_validation = '';
    this.text_success = '';

    if (this.specialitieForm.invalid) {
      this.text_validation = 'Nombre es requerido';
      return;
    }

    const data = this.specialitieForm.value;

    if (this.isEditing && this.specialitie_id) {
      this.specialitieService.editSpecialities(data, this.specialitie_id).subscribe((resp: any) => {
        this.handleResponse(resp, 'editada');
      });
    } else {
      this.specialitieService.storeSpecialities(data).subscribe((resp: any) => {
        this.handleResponse(resp, 'creada');
      });
    }
  }

  private handleResponse(resp: any, action: string) {
    if (resp.message === 403) {
      this.text_validation = resp.message_text;
    } else {
      this.text_success = `La especialidad se ha ${action} correctamente`;
      setTimeout(() => {
        this.router.navigate(['/specialities/list']);
      }, 1500);
    }
  }
}

