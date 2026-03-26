import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { routes } from 'src/app/shared/routes/routes';
import { DoctorService } from '../../../services/doctor.service';
import { LocationService } from 'src/app/services/location.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-location-form',
  templateUrl: './location-form.component.html',
  styleUrls: ['./location-form.component.scss']
})
export class LocationFormComponent implements OnInit {
  public routes = routes;
  public isEdit = false;
  public locationId: number | null = null;
  
  locationForm: FormGroup;
  FILE_AVATAR: File | null = null;
  IMAGE_PREVISUALIZA = 'assets/img/user-06.jpg';
  
  text_validation: string | null = null;
  
  constructor(
    private fb: FormBuilder,
    public locationService: LocationService,
    public doctorService: DoctorService,
    public router: Router,
    public activatedRoute: ActivatedRoute
  ) {
    this.locationForm = this.fb.group({
      title: ['', [Validators.required]],
      phone1: [''],
      phone2: [''],
      zip: [''],
      state: [''],
      email: ['', [Validators.email]],
      city: [''],
      address: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    window.scrollTo(0, 0);
    this.doctorService.closeMenuSidebar();
    this.activatedRoute.params.subscribe((params: any) => {
      if (params['id']) {
        this.isEdit = true;
        this.locationId = +params['id'];
        this.getConfig();
        this.showLocation();
      } else {
        this.isEdit = false;
        this.getConfig();
      }
    });
  }

  getConfig() {
    this.locationService.listConfig().subscribe((resp: any) => {
      console.log(resp);
    });
  }

  showLocation() {
    if (this.locationId) {
      this.locationService.getLocation(this.locationId).subscribe((resp: any) => {
        console.log(resp);
        const location = resp.location;
        this.locationForm.patchValue({
          title: location.title,
          phone1: location.phone1,
          phone2: location.phone2,
          zip: location.zip,
          state: location.state,
          email: location.email,
          city: location.city,
          address: location.address
        });
        this.IMAGE_PREVISUALIZA = location.avatar;
      });
    }
  }

  loadFile(event: any) {
    const file = event.target.files[0];
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
    if (this.locationForm.invalid) {
      this.text_validation = 'Los campos con * son obligatorios';
      return;
    }

    const formData = new FormData();
    const formValue = this.locationForm.value;
    formData.append('title', formValue.title);
    formData.append('phone1', formValue.phone1 || '');
    formData.append('phone2', formValue.phone2 || '');
    formData.append('city', formValue.city || '');
    formData.append('state', formValue.state || '');
    formData.append('zip', formValue.zip || '');
    formData.append('address', formValue.address);
    formData.append('email', formValue.email || '');

    if (this.FILE_AVATAR) {
      formData.append('imagen', this.FILE_AVATAR);
    }

    if (this.isEdit && this.locationId) {
      this.locationService.editLocation(formData, this.locationId).subscribe((resp: any) => {
        if (resp.message === 403) {
          this.text_validation = resp.message_text;
        } else {
          Swal.fire('Updated', 'Location has been updated', 'success');
          this.router.navigate(['/location/list']);
        }
      });
    } else {
      this.locationService.storeLocation(formData).subscribe((resp: any) => {
        if (resp.message === 403) {
          this.text_validation = resp.message_text;
        } else {
          this.router.navigate(['/location/list']);
        }
      });
    }
  }

  get f() { return this.locationForm.controls; }
}

