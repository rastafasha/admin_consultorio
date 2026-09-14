import { Component } from '@angular/core';
import { TasaPersonalizada } from '../../../models/tasaPersonalizada';
import { TasapersonalizadaService } from '../../../services/tasapersonalizada.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tasapersonalizada-edit',
  standalone: false,
  templateUrl: './tasapersonalizada-edit.component.html',
  styleUrl: './tasapersonalizada-edit.component.scss'
})
export class TasapersonalizadaEditComponent {

   public tasasPersonalizada!: TasaPersonalizada;
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
        private tasaPersonalizadaService: TasapersonalizadaService,
      ) { }
    
      ngOnInit(): void {
        
         window.scrollTo(0, 0);
        const USER = localStorage.getItem("user");
        this.user = JSON.parse(USER ? USER: '');
        this.roles = this.user.roles[0];
        this.getPersonalizadaTasas();
      }
    
      
    
      getPersonalizadaTasas() {
        this.isLoading = true;
        this.tasaPersonalizadaService.getTasasByUser(this.user.id).subscribe((resp: any) => {
          this.tasasPersonalizada = resp.tasa;
          this.isLoading = false;
        });
      }
    
    
      save() {
        const data = {
          precio_dia: this.precio_dia,
          usuario: this.user.id
        };
        this.tasaPersonalizadaService.createTasa(data)
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
            this.getPersonalizadaTasas();
          });
      }
    
     deleteTasa(tasasPersonalizada: any) {
        // 🧪 Imprime en consola para verificar qué datos tiene el objeto real
        console.log('Objeto tasa recibido:', tasasPersonalizada);
    
        // 🎯 CORRECCIÓN: Validamos si tu backend usa id o _id
        const idParaEliminar = tasasPersonalizada.id || tasasPersonalizada._id;
    
        if (!idParaEliminar) {
            console.error('❌ No se encontró un ID válido en el objeto:', tasasPersonalizada);
            return;
        }
    
        this.tasaPersonalizadaService.deleteTasaPersonalizada(idParaEliminar)
            .subscribe((resp: any) => {
                console.log('✅ Tasa eliminada con éxito del servidor');
                this.getPersonalizadaTasas(); // Recarga la tabla de inmediato
            });
    }

}
