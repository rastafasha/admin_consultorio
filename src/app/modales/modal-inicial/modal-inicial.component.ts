import { AfterViewInit, Component } from '@angular/core';
declare let $: any;

@Component({
  selector: 'app-modal-inicial',
  standalone: false,
  templateUrl: './modal-inicial.component.html',
  styleUrls: ['./modal-inicial.component.css']
})
export class ModalInicialComponent implements AfterViewInit {

  isLogued: boolean;
  currentStep = 1;
  showModal = false;


  ngAfterViewInit() {
    const isDismissed = localStorage.getItem('modalInicialDismissed');
    const isLogued = !!localStorage.getItem("user");

    // Si ya lo cerró o no está logueado, no hacemos nada
    if (isDismissed === 'true' || !isLogued) {
      return;
    }

    // Usamos un pequeño delay para asegurar que Bootstrap y el DOM estén sincronizados
    setTimeout(() => {
      const modalElement = document.getElementById('modalInical'); 
      if (modalElement) {
        const bootstrap = (window as any).bootstrap;
        const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
        modalInstance.show();
      } else {
        console.error("¡Cuidado! El ID 'modalInical' no existe en el HTML de este componente.");
      }
    }, 500);
  }



  onNoShowMore() {
    localStorage.setItem('modalInicialDismissed', 'true');
    const modalElement = document.getElementById('modalInical');
    const modalInstance = (window as any).bootstrap.Modal.getInstance(modalElement);
    modalInstance?.hide();
  }

  nextStep() {
    this.currentStep = 2;
  }

  prevStep() {
    this.currentStep = 1;
  }
}
