import { Component } from '@angular/core';
import { Tasabcv } from 'src/app/models/tasabcba';
import { TasabcvService } from 'src/app/services/tasabcv.service';
import { routes } from 'src/app/shared/routes/routes';
import Swal from 'sweetalert2';
@Component({
    selector: 'app-tasabcv-edit',
    templateUrl: './tasabcv-edit.component.html',
    styleUrls: ['./tasabcv-edit.component.scss'],
    standalone: false
})
export class TasabcvEditComponent {
 public tasasbcv!: Tasabcv[];
  error!: string;
  uploadError!: string;
  precio_dia!: number;
  tipoSeleccionado = false;
  title = 'Tasa de cambio BCV';
  isLoading = false;
  user:any;
  roles:any;

  constructor(
    private tasaBcvService: TasabcvService,
  ) { }

  ngOnInit(): void {
    this.getTasas();
     window.scrollTo(0, 0);
    const USER = localStorage.getItem("user");
    this.user = JSON.parse(USER ? USER: '');
    this.roles = this.user.roles[0];
  }


  getTasas() {
    this.isLoading = true;
    this.tasaBcvService.getTasas().subscribe((resp: any) => {
      this.tasasbcv = resp;
      this.isLoading = false;
    });
  }


  save() {
    const data = {
      precio_dia: this.precio_dia,
    };
    this.tasaBcvService
      .createTasaBcv(data)
      .subscribe((resp: any) => {
        // console.log(resp);
        this.precio_dia;
        // this.tipo ='';
        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Actualizado',
          showConfirmButton: false,
          timer: 1500,
        });
        this.getTasas();
      });
  }

  deleteTasa(tasa: any) {
    this.tasaBcvService
      .deleteTasaBcv(tasa.id)
      .subscribe((resp: any) => {
        this.getTasas();
      });
  }


}
