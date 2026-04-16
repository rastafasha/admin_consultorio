import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class PwaService {

    private promptEvent: any = null;
    // Usamos un signal para que la UI reaccione instantáneamente
    public showInstallButton = signal(false);

    constructor() { }

    public initPwaPrompt() {
        window.addEventListener('beforeinstallprompt', (event: any) => {
            // Evita que el navegador muestre su propio banner automático
            event.preventDefault();
            // Guarda el evento para usarlo luego
            this.promptEvent = event;
            // Muestra tu botón personalizado
            this.showInstallButton.set(true);
        });
    }
    public async installPwa() {
        if (!this.promptEvent) return;

        // Oculta el botón inmediatamente para evitar doble click
        this.showInstallButton.set(false);

        // Muestra el prompt nativo
        this.promptEvent.prompt();

        // Espera la respuesta del usuario
        const { outcome } = await this.promptEvent.userChoice;

        if (outcome === 'accepted') {
            console.log('Usuario aceptó la instalación');
        } else {
            console.log('Usuario rechazó la instalación');
            // Si quieres que el botón vuelva a aparecer si rechazó, descomenta la siguiente línea:
            // this.showInstallButton.set(true);
        }

        // Limpia el evento porque ya no es válido
        this.promptEvent = null;
    }
}