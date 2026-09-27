import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, shareReplay, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ConsultorioCRM {
  _id: string;
  name: string;
  slug: string;
  tipoClinica: 'Consultorio' | 'Clinica'; 
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

  private http = inject(HttpClient);
  private backendNode = environment.backend_CRM_node; 
  
  private clinicaCache$!: Observable<ConsultorioCRM | null>;
  private cacheSlug: string = '';
  private clinicaActual: ConsultorioCRM | null = null;

  // 🚀 FLAG POLIMÓRFICO DINÁMICO GOBERNADO POR EL CRM
  public isClinicMode: boolean = false;

  /**
   * 🗺️ Extrae el slug/subdominio de la URL del navegador de forma polimórfica.
   * Soporta tanto URLs planas de captación como subdominios de segundo nivel administrativo.
   */
  obtenerSlugDeUrl(): string {
    const host = window.location.hostname;
    const domainParts = host.split('.'); 

    // 1. Entorno de desarrollo local (Simulador por environment)
    if (host === 'localhost' || host === '127.0.0.1') {
      return environment.nombreSelected || 'clinica-prueba';
    }

    // 2. Control de subdominios en producción
    if (domainParts.length >= 3) {
      // 👔 Caso A: URL del Panel Administrativo de Vercel (ej: ://klyntic.com)
      // El arreglo queda: ['clinica-sanitas', 'admin', 'klyntic', 'com'] -> El slug está en el índice 0
      if (domainParts[1] === 'admin') {
        return domainParts[0].toLowerCase().trim();
      }

      // 🩺 Caso B: URL Pública tradicional de Express (ej: ://klyntic.com)
      // El arreglo queda: ['clinica-sanitas', 'klyntic', 'com'] -> Validamos que no sea el prefijo www
      if (domainParts[0] !== 'www') {
        return domainParts[0].toLowerCase().trim();
      }
    }

    // Fallback de seguridad si entra por el dominio raíz limpio
    return environment.nombreSelected || 'clinica-prueba';
  }

  /**
   * 🛰️ Consulta los datos del subdominio actual en el CRM de Node.js (Optimizado Enterprise)
   */
  getClinicaBySlugCached(slug: string): Observable<ConsultorioCRM | null> {
    const slugFormateado = slug.toLowerCase().trim();

    // 🚀 BYPASS SAAS: Si el subdominio es tu subdominio maestro fijo de médicos independientes,
    // apagamos el modo clínica de inmediato y saltamos la consulta a MongoDB Atlas.
    if (slugFormateado === 'consultorio') {
      this.isClinicMode = false;
      this.clinicaActual = null;
      return of(null);
    }

    if (this.clinicaCache$ && this.cacheSlug === slugFormateado) {
      return this.clinicaCache$;
    }

    this.cacheSlug = slugFormateado;
    const URL = `${this.backendNode}/consultorios/by-slug/${slugFormateado}`;

    this.clinicaCache$ = this.http.get<{ ok: boolean, consultorio: ConsultorioCRM }>(URL).pipe(
      map(response => {
        if (response && response.ok && response.consultorio) {
          // 🎯 CAPTURA EN CALIENTE: Guardamos la instancia de la clínica en memoria
          this.clinicaActual = response.consultorio;
          
          // 🔥 DETECCIÓN DINÁMICA: Si el flag en Node es 'Clinica', se enciende el entorno institucional
          this.isClinicMode = response.consultorio.tipoClinica === 'Clinica';
          
          return response.consultorio;
        }
        
        this.isClinicMode = false;
        this.clinicaActual = null;
        return null;
      }),
      shareReplay(1),
      catchError(error => {
        console.error('❌ Error de comunicación con el CRM de Node.js:', error);
        this.isClinicMode = false;
        this.clinicaActual = null;
        return of(null);
      })
    );

    return this.clinicaCache$;
  }

  /**
   * 🏢 EXTRAE EL ID ACTUAL EN CALIENTE
   */
  getClinicaIdActual(): string {
    if (this.clinicaActual && this.clinicaActual._id) {
      return this.clinicaActual._id;
    }
    return '';
  }

  /**
   * 🎨 Inyecta dinámicamente los estilos CSS guardados en MongoDB 
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
    this.isClinicMode = false;
    this.clinicaActual = null;
    this.clinicaCache$ = of(null);
  }
}