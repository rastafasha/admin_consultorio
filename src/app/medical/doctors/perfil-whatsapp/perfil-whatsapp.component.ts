import { Component, OnInit, OnDestroy } from '@angular/core';
import { ConsultorioService } from '../../../services/consultorio.service';
import { AuthService } from '../../../shared/auth/auth.service';
import { NotificacionService } from '../../../services/notificacion.service'; // 👈 IMPORTA TU SERVICIO DE SOCKETS
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-perfil-whatsapp',
  standalone: false,
  templateUrl: './perfil-whatsapp.component.html',
  styleUrl: './perfil-whatsapp.component.scss'
})
export class PerfilWhatsappComponent implements OnInit, OnDestroy {

  doctorId: string;
  whatsappStatus: string = 'DESCONECTADO'; // DESCONECTADO, CARGANDO, ESPERANDO_QR, CONECTADO
  whatsappQR: string = ''; // 🚀 Variable ÚNICA para el [src] del <img> de tu HTML
  cargando: boolean = false;
  user: any;
  public whatsappQRString: string = '';

  constructor(
    private consultorioService: ConsultorioService,
    private authService: AuthService,
    private notificacionService: NotificacionService // 👈 INYECTA EL SERVICIO DE SOCKETS
  ) { }

  ngOnInit() {
    this.user = this.authService.getLocalStorage();
    this.doctorId = this.user.id;

    // 1. Al cargar la pantalla, revisamos el estado actual guardado en base de datos
    this.verificarEstadoActual();

    // 2. 🔌 ESCUCHA EN TIEMPO REAL: Reemplaza el Polling por la oreja del Socket
    this.activarEscuchaSocket();
  }

  verificarEstadoActual() {
    this.consultorioService.obtenerEstadoWhatsApp(this.doctorId).subscribe({
      next: (res) => {
        if (res) {
          this.whatsappStatus = res.whatsappStatus;
          // Si el servidor ya tenía un QR listo, lo asignamos directamente
          if (this.whatsappStatus === 'ESPERANDO_QR' && res.whatsappQR) {
            this.whatsappQR = res.whatsappQR;
          }
        }
      },
      error: (err) => console.error('Error obteniendo estado inicial:', err)
    });
  }

  solicitarConexion() {
    this.cargando = true;
    this.whatsappStatus = 'CARGANDO';
    this.whatsappQR = '';

    this.consultorioService.conectarWhatsApp(this.doctorId).subscribe({
      next: () => {
        this.cargando = false;
        // Mantenemos el estado en CARGANDO. El socket se encargará de cambiarlo a ESPERANDO_QR
      },
      error: (err) => {
        this.cargando = false;
        this.whatsappStatus = 'DESCONECTADO';
        console.error('Error al encender el bot de WhatsApp:', err);
      }
    });
  }

  /**
   * 🔥 REEMPLAZO DEL POLLING: Escucha pasiva desde el socket centralizado
   */
  activarEscuchaSocket() {
  const socket = this.notificacionService['socket'];
  if (!socket) return;

  socket.on('whatsapp-status-changed', (data: { doctorId: string, whatsappStatus: string, whatsappQR?: string }) => {
    if (data.doctorId.toString() !== this.doctorId.toString()) return;

    this.whatsappStatus = data.whatsappStatus;

    // Inyectamos la imagen Base64 directo a la variable que lee el [src] del HTML
    if (this.whatsappStatus === 'ESPERANDO_QR' && data.whatsappQR) {
      this.whatsappQR = data.whatsappQR; 
    }
    
    if (this.whatsappStatus === 'CONECTADO') {
      this.whatsappQR = '';
    }
  });
}


  // dibujarCodigoQR() {
  //   setTimeout(() => {
  //     const canvas = document.getElementById('canvas-qr') as HTMLCanvasElement;
  //     if (canvas && this.whatsappQRString) {
  //       QRCode.toCanvas(canvas, this.whatsappQRString, { width: 250 }, (error) => {
  //         if (error) console.error('Error generando el canvas QR:', error);
  //       });
  //     }
  //   }, 100);
  // }

  ngOnDestroy() {
    // 🧹 Apagamos el canal del socket para evitar duplicaciones si el médico navega a otra pantalla
    const socket = this.notificacionService['socket'];
    if (socket) {
      socket.off('whatsapp-status-changed');
    }
  }
}
