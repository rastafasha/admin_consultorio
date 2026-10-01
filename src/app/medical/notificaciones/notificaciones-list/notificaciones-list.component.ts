import { Component } from '@angular/core';
import { DoctorService } from '../../../services/doctor.service';
import { RolesService } from '../../../services/roles.service';
import { NotificacionService } from '../../../services/notificacion.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-notificaciones-list',
  standalone:false,
  templateUrl: './notificaciones-list.component.html',
  styleUrl: './notificaciones-list.component.scss'
})
export class NotificacionesListComponent {
  user:any;
  roles:any;
  cargando = false;
    p: number = 1;
  count: number = 8;
  // Lista flexible 'any' para evitar trancas de tipado con el populate del usuario
    public historialNotificaciones: any[] = [];
  constructor(
      public doctorService: DoctorService,
      public roleService: RolesService,
      public notiService: NotificacionService,
      ){
  
    }
  ngOnInit() {
    window.scrollTo(0, 0);
    this.doctorService.closeMenuSidebar();
    
    // 🟢 BLINDAJE: Obtenemos el usuario directamente del almacenamiento local como respaldo seguro
    const userString = localStorage.getItem('user');
    this.user = userString ? JSON.parse(userString) : this.roleService.authService.user;
    
    if (this.user && this.user.roles) {
      this.roles = Array.isArray(this.user.roles) ? this.user.roles[0] : this.user.roles;
    }
    
    this.cargarHistorial(this.p);
  }

  isPermission(permission:string){
    if(this.user.roles.includes('SUPERADMIN')){
      return true;
    }
    if(this.user.permissions.includes(permission)){
      return true;
    }
    return false;
  }


  cargarHistorial(page: number) {
    this.cargando = true;
    this.notiService.obtenerHistorialCompleto(page).subscribe({
      next: (res) => {
        if (res.ok && res.notificaciones) {
          this.historialNotificaciones = res.notificaciones;
          this.cargando = false;
        }
      },
      error: (err) => {
        console.error('Error al cargar el historial:', err);
        this.historialNotificaciones = [];
         this.cargando = false;
      }
    });
  }

  // 🟢 Esta función recibe el evento del plugin cuando el admin avanza o retrocede
  cambiarPagina(eventoPage: number) {
    this.p = eventoPage;          // Sincroniza la vista de Angular
    this.cargarHistorial(this.p); // Llama al backend a traer la página solicitada
  }

  atenderNotificacion(notif: any) {
    this.notiService.marcarUnaComoLeida(notif._id).subscribe(() => {
      const ruta = (this.notiService as any).determinarRutaAdmin(notif.tipo, notif.referenciaId);
      this.notiService.router.navigate([ruta]);
    });
  }

  eliminarIndividual(id: string) {
    this.notiService.borrarNotificacion(id).subscribe(() => {
      this.cargarHistorial(this.p);
    });
  }

 

  vaciarTodo() {
  
      Swal.fire({
        title: '¿Estás seguro de que deseas eliminar todas las notificaciones de tu historial?',
        text: "No podras recuperarlo!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si, Borrar!'
      }).then((result) => {
        if (result.isConfirmed) {
          this.notiService.limpiarBuzonCompleto().subscribe((resp: any) => {
            this.historialNotificaciones = [];
          })
          Swal.fire(
            'Borrado!',
            'Historial borrado.',
            'success'
          )
          this.ngOnInit();
        }
      });
  
    }

}
