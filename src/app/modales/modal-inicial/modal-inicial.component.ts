import { AfterViewInit, Component, ElementRef, ViewChild, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-modal-inicial',
  standalone: false,
  templateUrl: './modal-inicial.component.html',
  styleUrls: ['./modal-inicial.component.css']
})
export class ModalInicialComponent implements AfterViewInit, OnDestroy {

  @ViewChild('modalInicialRef', { static: false }) modalRef!: ElementRef;

  currentStep = 1;
  private modalInstance: any = null;
  // 🔒 EL CANDADO: Bandera de seguridad para impedir ejecuciones duplicadas
  private isModalOpen = false; 

  ngAfterViewInit() {
    const isDismissed = localStorage.getItem('modalInicialDismissed');
    const isLogued = !!localStorage.getItem("user");

    // Si ya lo cerró, no está logueado o ya hay un modal abriéndose, cancelamos
    if (isDismissed === 'true' || !isLogued || this.isModalOpen) {
      return;
    }

    setTimeout(() => {
      // Doble verificación de seguridad antes de disparar el modal
      if (this.modalRef && this.modalRef.nativeElement && !this.isModalOpen) {
        const bootstrap = (window as any).bootstrap;
        
        // Matamos cualquier instancia previa que Bootstrap haya dejado colgada en este nodo
        const existingInstance = bootstrap.Modal.getInstance(this.modalRef.nativeElement);
        if (existingInstance) {
          existingInstance.dispose();
        }

        // Activamos el candado e inicializamos de forma única
        this.isModalOpen = true;
        this.modalInstance = bootstrap.Modal.getOrCreateInstance(this.modalRef.nativeElement, {
          backdrop: false, // Desactiva el fondo negro nativo que bloquea la pantalla
          keyboard: false  // Evita cierres accidentales con la tecla Escape
        });
        
        this.modalInstance.show();
      }
    }, 650); // Tiempo calibrado para esperar que el Dashboard termine de estructurarse
  }

  onNoShowMore() {
    localStorage.setItem('modalInicialDismissed', 'true');
    this.isModalOpen = false;

    if (this.modalInstance) {
      this.modalInstance.hide();
    }

    // Limpieza forzada inmediata de cualquier residuo en el DOM
    setTimeout(() => {
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach(backdrop => backdrop.remove());

      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }, 100);
  }

   onClose() {
    this.isModalOpen = false;
     if (this.modalInstance) {
      this.modalInstance.hide();
    }
    // Limpieza forzada inmediata de cualquier residuo en el DOM
    setTimeout(() => {
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach(backdrop => backdrop.remove());

      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }, 100);

    
  }

  nextStep() { this.currentStep = 2; }
  prevStep() { this.currentStep = 1; }

  ngOnDestroy() {
    // 🧹 Limpieza al destruir el componente para evitar fugas de memoria
    if (this.modalInstance) {
      this.modalInstance.dispose();
    }
  }
}
