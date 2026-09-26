import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, shareReplay, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ConsultorioCRM {
  _id: string;
  name: string;
  slug: string;
  tipoClinica: 'Consultorio' | 'Clinica'; // 👈 Tus strings reales con mayúscula inicial
  status: string;
  statusapp: string;
  ciudad: string;
  address: string;
  phone: string;
  img_logo?: string;
  css_personalizado?: string;
  ConsultasyTarifasList?: any[];
  Servicios_procedimientosList?: any[];
  vacunasList?: any[];
  usavacunas?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ClinicaService {

  // Inyección de dependencias moderna
  private http = inject(HttpClient);
  
  // URL de tu CRM de Node.js (ej: http://localhost:3000/api)
  private backendNode = environment.backend_CRM_node; 
  
  // Caché reactiva para evitar pegarle a Node.js en cada cambio de vista administrativa
  private clinicaCache$!: Observable<ConsultorioCRM | null>;
  private cacheSlug: string = '';

  /**
   * 🗺️ Extrae el slug/subdominio de la URL del navegador.
   * Si estás en localhost, recurre de forma segura a tu simulador 'environment.nombreSelected'
   */
  obtenerSlugDeUrl(): string {
    const host = window.location.hostname;
    const domainParts = host.split('.');

    // Si detecta que estás en entorno de desarrollo local plano
    if (host === 'localhost' || host === '127.0.0.1') {
      return environment.nombreSelected || 'clinica-prueba';
    }

    // Si posee estructura de subdominio real (ej: ://klyntic.com)
    if (domainParts.length >= 3 && domainParts[0] !== 'www') {
      return domainParts[0];
    }

    return environment.nombreSelected || 'clinica-prueba';
  }

  /**
   * 🛰️ Consulta los datos del subdominio actual en el CRM de Node.js
   * Implementa shareReplay para que la petición se ejecute una sola vez en el ciclo de vida
   */
  getClinicaBySlugCached(slug: string): Observable<ConsultorioCRM | null> {
    const slugFormateado = slug.toLowerCase().trim();

    // Si la caché está viva y es para el mismo subdominio, la retornamos de inmediato
    if (this.clinicaCache$ && this.cacheSlug === slugFormateado) {
      return this.clinicaCache$;
    }

    this.cacheSlug = slugFormateado;
    const URL = `${this.backendNode}/consultorios/by-slug/${slugFormateado}`;

    this.clinicaCache$ = this.http.get<{ ok: boolean, consultorio: ConsultorioCRM }>(URL).pipe(
      map(response => {
        if (response && response.ok) {
          return response.consultorio;
        }
        return null;
      }),
      // Almacena el último resultado exitoso y se lo comparte a todos los componentes que se suscriban
      shareReplay(1),
      catchError(error => {
        console.error('❌ Error de comunicación con el CRM de Node.js:', error);
        return of(null);
      })
    );

    return this.clinicaCache$;
  }

  /**
   * 🎨 Inyecta dinámicamente los estilos CSS guardados en MongoDB 
   * en la cabecera del documento para pintar el panel privado
   */
  aplicarEstilosDinamicos(css: string | undefined): void {
    if (!css) return;

    const estiloPrevio = document.getElementById('css-dinamico-klyntic');
    if (estiloPrevio) estiloPrevio.remove();

    const estilo = document.createElement('style');
    estilo.id = 'css-dinamico-klyntic';
    estilo.innerHTML = css;
    document.head.appendChild(estilo);
  }

  /**
   * 🧹 Limpia la caché si la secretaria cambia de entorno o hace logout
   */
  limpiarCache(): void {
    this.cacheSlug = '';
    // Nos aseguramos de inicializar la caché para evitar referencias muertas
    this.clinicaCache$ = of(null);
  }
}