import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { TasaEurobcv } from '../../../models/tasaeurobcv';
import { DoctorService } from '../../../services/doctor.service';
import { TasaeurobcvService } from '../../../services/tasaeurobcv.service';

@Component({
  selector: 'app-tasabcveuro-edit',
  standalone: false,
  templateUrl: './tasabcveuro-edit.component.html',
  styleUrl: './tasabcveuro-edit.component.scss'
})
export class TasabcveuroEditComponent {

   public tasasbcvEuro!: TasaEurobcv[];
    error!: string;
    uploadError!: string;
    precio_dia!: number;
    tipoSeleccionado = false;
    title = 'Tasa de cambio BCV';
    isLoading = false;
    user:any;
    roles:any;
    moneda:string;
  
    constructor(
      private tasaEuroBcvService: TasaeurobcvService,
    ) { }
  
    ngOnInit(): void {
      
       window.scrollTo(0, 0);
      const USER = localStorage.getItem("user");
      this.user = JSON.parse(USER ? USER: '');
      this.getEuroTasas();
    }
  
    
  
    getEuroTasas() {
      this.isLoading = true;
      this.tasaEuroBcvService.getTasas().subscribe((resp: any) => {
        this.tasasbcvEuro = resp;
        this.isLoading = false;
      });
    }
  
  
    save() {
      const data = {
        precio_dia: this.precio_dia,
      };
      this.tasaEuroBcvService.createTasaBcv(data)
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
          this.getEuroTasas();
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
  
      this.tasaEuroBcvService.deleteTasaBcv(idParaEliminar)
          .subscribe((resp: any) => {
              console.log('✅ Tasa eliminada con éxito del servidor');
              this.getEuroTasas(); // Recarga la tabla de inmediato
          });
  }


}
