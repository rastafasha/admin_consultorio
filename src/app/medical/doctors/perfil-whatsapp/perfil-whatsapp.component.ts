import { Component } from '@angular/core';
import { ConsultorioService } from '../../../services/consultorio.service';
import { AuthService } from '../../../shared/auth/auth.service';

@Component({
  selector: 'app-perfil-whatsapp',
  imports: [],
  templateUrl: './perfil-whatsapp.component.html',
  styleUrl: './perfil-whatsapp.component.scss'
})
export class PerfilWhatsappComponent {

  doctorId: string; // Este ID lo recuperas de tu AuthService (Tu seeder tiene al Dr. ID: 2)
  whatsappStatus: string = 'DESCONECTADO';
  whatsappQR: string = '';
  pollingInterval: any;
  cargando: boolean = false;
  user:any;
  
  constructor(
    private consultorioService: ConsultorioService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.user = this.authService.getLocalStorage();
    this.doctorId = this.user.id;
    // Al cargar la pantalla, revisamos de una vez cómo está su conexión
    this.verificarEstadoActual();
  }

  verificarEstadoActual() {
    this.consultorioService.obtenerEstadoWhatsApp(this.doctorId).subscribe(res => {
      if (res) {
        this.whatsappStatus = res.whatsappStatus;
        if (this.whatsappStatus === 'ESPERANDO_QR') {
          this.iniciarPolling(); // Si se quedó a medias, reactivamos el bucle
        }
      }
    });
  }

  solicitarConexion() {
    this.cargando = true;
    this.consultorioService.conectarWhatsApp(this.doctorId).subscribe(res => {
      this.whatsappStatus = 'ESPERANDO_QR';
      this.cargando = false;
      this.iniciarPolling(); // Arrancamos el bucle de consulta cada 3 segundos
    });
  }

  iniciarPolling() {
    if (this.pollingInterval) return; // Evita duplicar bucles en memoria

    this.pollingInterval = setInterval(() => {
      this.consultorioService.obtenerEstadoWhatsApp(this.doctorId).subscribe(res => {
        this.whatsappStatus = res.whatsappStatus;
        this.whatsappQR = res.whatsappQR; // String en Base64 listo para pintar

        // 🛑 CONDICIÓN DE PARADA: Si el doctor ya escaneó el QR, rompemos el bucle
        if (this.whatsappStatus === 'CONECTADO' || this.whatsappStatus === 'DESCONECTADO') {
          this.detenerPolling();
        }
      });
    }, 3000); // 3 segundos exactos de intervalo
  }

  detenerPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  ngOnDestroy() {
    this.detenerPolling(); // Seguridad: Si el médico cambia de pantalla, matamos el bucle
  }

}
