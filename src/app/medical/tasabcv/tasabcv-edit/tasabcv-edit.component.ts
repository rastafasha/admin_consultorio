import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { Tasabcv } from '../../../models/tasabcba';
import { TasadollarbcvService } from '../../../services/tasabcv.service';
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
    private tasaBcvService: TasadollarbcvService,
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
    // 🧪 Imprime en consola para verificar qué datos tiene el objeto real
    console.log('Objeto tasa recibido:', tasa);

    // 🎯 CORRECCIÓN: Validamos si tu backend usa id o _id
    const idParaEliminar = tasa.id || tasa._id;

    if (!idParaEliminar) {
        console.error('❌ No se encontró un ID válido en el objeto:', tasa);
        return;
    }

    this.tasaBcvService
        .deleteTasaBcv(idParaEliminar)
        .subscribe((resp: any) => {
            console.log('✅ Tasa eliminada con éxito del servidor');
            this.getTasas(); // Recarga la tabla de inmediato
        });
}



}
