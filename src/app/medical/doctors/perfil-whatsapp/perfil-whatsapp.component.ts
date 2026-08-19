import { Component, OnInit, OnDestroy } from '@angular/core';
import { ConsultorioService } from '../../../services/consultorio.service';
import { AuthService } from '../../../shared/auth/auth.service';
import { NotificacionService } from '../../../services/notificacion.service'; // 👈 IMPORTA TU SERVICIO DE SOCKETS
import * as QRCode from 'qrcode';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

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
  // 🚀 NUEVO: Referencia para el temporizador de respaldo en la nube de Render
  private respaldoInterval: any;

  constructor(
    private sanitizer: DomSanitizer,
    private consultorioService: ConsultorioService,
    private authService: AuthService,
    private notificacionService: NotificacionService // 👈 INYECTA EL SERVICIO DE SOCKETS
  ) { }

  sanitizarQR(base64String: string): SafeUrl {
  if (!base64String) return '';
  return this.sanitizer.bypassSecurityTrustUrl(base64String);
}

  ngOnInit() {
    this.user = this.authService.getLocalStorage();
    this.doctorId = String(this.user.id);

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
        
        // 🚀 SOLUCIÓN: Activamos un Polling de respaldo por si el Socket de Render se durmió o desconectó
        this.activarPollingRespaldo();
      },
      error: (err) => {
        this.cargando = false;
        this.whatsappStatus = 'DESCONECTADO';
        console.error('Error al encender el bot de WhatsApp:', err);
      }
    });
  }

  /**
   * ⏳ NUEVO: Mecanismo de seguridad que rescata el estado por HTTP ordinario si el Socket falla
   */
  activarPollingRespaldo() {
    if (this.respaldoInterval) clearInterval(this.respaldoInterval);

    // Pregunta a Render mediante HTTP común cada 3 segundos
    this.respaldoInterval = setInterval(() => {
      this.consultorioService.obtenerEstadoWhatsApp(this.doctorId).subscribe({
        next: (res) => {
          if (res) {
            // Si la base de datos o la RAM en Render ya cambiaron de estado, actualizamos Angular
            if (res.whatsappStatus === 'ESPERANDO_QR' || res.whatsappStatus === 'CONECTADO') {
              console.log(`🎯 Respaldo HTTP rescató el estado: ${res.whatsappStatus}`);
              
              this.whatsappStatus = res.whatsappStatus;
              this.whatsappQR = res.whatsappQR || '';
              
              // Si ya se conectó, podemos apagar con seguridad el temporizador
              if (res.whatsappStatus === 'CONECTADO') {
                clearInterval(this.respaldoInterval);
              }
            }
          }
        },
        error: (err) => console.error('Error en ciclo de polling de respaldo:', err)
      });
    }, 3500);
  }

  /**
   * 🔥 ESCUCHA PASIVA DESDE EL SOCKET CENTRALIZADO
   */
  activarEscuchaSocket() {
    const socket = this.notificacionService['socket'];
    if (!socket) return;

    socket.on('whatsapp-status-changed', (data: { doctorId: string, whatsappStatus: string, whatsappQR?: string }) => {
      if (data.doctorId.toString() !== this.doctorId.toString()) return;

      console.log('📡 Evento recibido por Sockets:', data.whatsappStatus);
      this.whatsappStatus = data.whatsappStatus;

      if (this.whatsappStatus === 'ESPERANDO_QR' && data.whatsappQR) {
        this.whatsappQR = data.whatsappQR; 
      }
      
      if (this.whatsappStatus === 'CONECTADO') {
        this.whatsappQR = '';
        if (this.respaldoInterval) clearInterval(this.respaldoInterval); // Apaga el respaldo
      }
    });
  }

  ngOnDestroy() {
    // 🧹 Limpieza absoluta de Sockets e Intervals al salir de la pantalla
    if (this.respaldoInterval) {
      clearInterval(this.respaldoInterval);
    }
    
    const socket = this.notificacionService['socket'];
    if (socket) {
      socket.off('whatsapp-status-changed');
    }
    }
}
