import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConnectionService } from './connection.service';
import { url_servicios } from '../config/config';
import Swal from 'sweetalert2';
import { AuthService } from '../shared/auth/auth.service';

interface OfflineRequest {
  urlPath: string;    // Ejemplo: '/appointment-atention/store'
  payload: any;       // El JSON del formulario
  tipo: string;       // Etiqueta visual ('Cita', 'Presupuesto', 'Paciente', 'Odontograma')
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class OfflineService {
  private STORAGE_KEY = 'klyntic_universal_offline_queue';

  constructor(
    private http: HttpClient, 
    private connectionService: ConnectionService,
    private authService: AuthService
  ) {
    // Escucha activa de red: Al volver el internet, procesa todo el consultorio
    this.connectionService.checkStatus().subscribe(online => {
      if (online) {
        this.processAllOfflineData();
      }
    });
  }

  /**
   * Guarda cualquier formulario del sistema ordenadamente en LocalStorage
   */
  saveFormOffline(urlPath: string, formData: any, tipoModulo: string) {
    const queue = this.getQueue();
    
    // Congelamos la hora real del reloj de la doctora usando el campo estándar 'created_at'
    const finalPayload = { 
      ...formData, 
      created_at: new Date().toISOString() 
    };

    queue.push({
      urlPath,
      payload: finalPayload,
      tipo: tipoModulo,
      timestamp: Date.now()
    });

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(queue));
    console.log(`[Klyntic Offline] ${tipoModulo} guardado localmente con su hora congelada.`);
  }

  // Sincroniza todo el lote pendiente en segundo plano
  private async processAllOfflineData() {
    const queue = this.getQueue();
    if (queue.length === 0) return;

    console.log(`[Klyntic Sync] Procesando ${queue.length} elementos pendientes...`);
    
    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.authService.token });
    const remainingQueue: OfflineRequest[] = [];
    
    // =========================================================================
    // MODIFICACIÓN 1: Inicializamos 'Odontograma' en el objeto de conteo
    // =========================================================================
    const conteo: { [key: string]: number } = { Cita: 0, Presupuesto: 0, Paciente: 0, Atencion: 0, Odontograma: 0 };

    for (const item of queue) {
      try {
        const fullURL = url_servicios + item.urlPath;
        
        // Enviamos a tu API normal (Laravel/Nodejs). Supabase recibirá el created_at congelado y lo guardará perfecto.
        await this.http.post(fullURL, item.payload, { headers }).toPromise();
        
        if (conteo[item.tipo] !== undefined) {
          conteo[item.tipo]++;
        } else {
          conteo[item.tipo] = 1;
        }
      } catch (error) {
        console.error(`[Klyntic Sync] Error en ${item.tipo}. Se mantiene en cola:`, error);
        remainingQueue.push(item);
      }
    }

    // Actualizamos el almacenamiento local
    if (remainingQueue.length > 0) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(remainingQueue));
    } else {
      localStorage.removeItem(this.STORAGE_KEY);
      
      // Armamos el reporte resumido estilo Apple
      let resumen = 'Toda tu información está a salvo en la nube.<br><br>';
      if (conteo['Paciente'] > 0) resumen += `• ${conteo['Paciente']} Paciente(s) registrado(s)<br>`;
      if (conteo['Cita'] > 0) resumen += `• ${conteo['Cita']} Cita(s) guardada(s)<br>`;
      if (conteo['Presupuesto'] > 0) resumen += `• ${conteo['Presupuesto']} Presupuesto(s) sincronizado(s)<br>`;
      if (conteo['Atencion'] > 0) resumen += `• ${conteo['Atencion']} Atención(es) médica(s) guardada(s)<br>`;
      
      // =========================================================================
      // MODIFICACIÓN 2: Añadimos la viñeta de texto para reportar el Odontograma
      // =========================================================================
      if (conteo['Odontograma'] > 0) resumen += `• ${conteo['Odontograma']} Diagnóstico(s) de Odontograma guardado(s)<br>`;
      
      Swal.fire({
        title: '¡Sincronización Completada!',
        html: resumen,
        icon: 'success',
        confirmButtonColor: '#0071e3',
        confirmButtonText: 'Excelente'
      });
    }
  }

  private getQueue(): OfflineRequest[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }
}
