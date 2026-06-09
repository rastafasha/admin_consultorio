import { Component } from '@angular/core';
import { ConsultorioService } from '../../../services/consultorio.service';
import { AuthService } from '../../../shared/auth/auth.service';
import * as QRCode from 'qrcode';
@Component({
  selector: 'app-perfil-whatsapp',
  standalone:false,
  templateUrl: './perfil-whatsapp.component.html',
  styleUrl: './perfil-whatsapp.component.scss'
})
export class PerfilWhatsappComponent {

  doctorId: string; // Este ID lo recuperas de tu AuthService (Tu seeder tiene al Dr. ID: 2)
  whatsappStatus: string = 'DESCONECTADO';
   public whatsappQRString: string = '';
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
    console.log(this.user)
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

   iniciarChequeoAutomatico() {
    // if (this.chequeoInterval) clearInterval(this.chequeoInterval);
    // const localId = typeof this.user.local === 'string' ? this.user.local : this.user.local?._id;

    // this.chequeoInterval = setInterval(() => {
    //   this.tiendaService.statusWhatsapp(localId).subscribe((resp: any) => {
    //     this.whatsappStatus = resp.whatsappStatus;
        
    //     // 💥 SI LLEGA EL QR, FORZAMOS EL DIBUJO EN EL CANVAS DEL HTML
    //     if (this.whatsappStatus === 'ESPERANDO_QR' && resp.whatsappQR) {
    //       this.whatsappQRString = resp.whatsappQR;
    //       this.dibujarCodigoQR();
    //     }
        
    //     if (this.whatsappStatus === 'CONECTADO') {
    //       this.whatsappQRString = '';
    //       clearInterval(this.chequeoInterval);
    //       console.log('🎉 ¡Dispositivo enlazado con éxito!');
    //     }
    //   });
    // }, 5000);
  }

  

   dibujarCodigoQR() {
    // Le damos un milisegundo de retraso para asegurar que Angular ya renderizó el elemento <canvas> en el DOM
    setTimeout(() => {
      const canvas = document.getElementById('canvas-qr') as HTMLCanvasElement;
      if (canvas && this.whatsappQRString) {
        QRCode.toCanvas(canvas, this.whatsappQRString, { width: 250 }, (error) => {
          if (error) console.error('Error generando el canvas QR:', error);
        });
      }
    }, 100);
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
