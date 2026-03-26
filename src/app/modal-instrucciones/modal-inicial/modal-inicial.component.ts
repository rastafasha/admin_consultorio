import { AfterViewInit, Component } from '@angular/core';
declare let $: any;

@Component({
  selector: 'app-modal-inicial',
  standalone: false,
  templateUrl: './modal-inicial.component.html',
  styleUrls: ['./modal-inicial.component.css']
})
export class ModalInicialComponent implements AfterViewInit {

  isLogued: boolean ;
  currentStep = 1;
  showModal = false;


  ngAfterViewInit() {
    const USER = localStorage.getItem("user");
    this.isLogued = !!USER;
    if (localStorage.getItem('modalInicialDismissed') || !this.isLogued) {
      return;
    }
    setTimeout(() => {
      const modalElement = $('#modalInical');
      if (modalElement.length) {
        modalElement.modal('show');
      }
      this.showModal = true;
    }, 500);
  }

  


  onNoShowMore() {
    localStorage.setItem('modalInicialDismissed', 'true');
    this.showModal = false;
  }

  nextStep() {
    this.currentStep = 2;
  }

prevStep() {
    this.currentStep = 1;
  }
}
