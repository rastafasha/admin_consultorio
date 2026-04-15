import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Payment } from 'src/app/models/payment.model';

@Component({
    selector: 'app-modal-imagenpago',
    templateUrl: './modal-imagenpago.component.html',
    styleUrls: ['./modal-imagenpago.component.scss'],
    standalone: false
})
export class ModalImagenpagoComponent {
  @Output() closeModal: EventEmitter<void> = new EventEmitter<void>();
  @Input() pagoSeleccionado: any | null = null;

  ngOnInit() {
    this.pagoSeleccionado;
  }
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['pagoSeleccionado'] && this.pagoSeleccionado) {
      const data = this.pagoSeleccionado;
      console.log(this.pagoSeleccionado);

    }
  }

 onClose() {
    this.closeAndCleanup();
    this.closeModal.emit();
  }

  // Función auxiliar para no repetir el código de limpieza de Bootstrap
  private closeAndCleanup() {
    const modalElement = document.getElementById('viewPago') as HTMLElement;
    if (modalElement) {
      const bootstrapModal = (window as any).bootstrap?.Modal?.getInstance(modalElement);
      if (bootstrapModal) bootstrapModal.hide();
    }
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) backdrop.remove();
    document.body.classList.remove('modal-open');
    document.body.style.paddingRight = '';
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    document.documentElement.style.overflowX = 'auto';
  }


}
