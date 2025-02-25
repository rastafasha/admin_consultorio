import { Component } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { Observable, catchError, of } from 'rxjs';
import { NewsletterService } from 'src/app/services/newsletter.service';

@Component({
  selector: 'app-subcribe-notification',
  templateUrl: './subcribe-notification.component.html',
  styleUrls: ['./subcribe-notification.component.scss']
})
export class SubcribeNotificationComponent {


    isLoggedIn$: Observable<boolean>;
    error: string;


    sub: PushSubscription;

    readonly VAPID_PUBLIC_KEY = 'BJJWX7_4iQ96ZmG23hF6ZoK_sfxewlxzCdL6I910xuXQ6zFu7Yg_w7ySPMeIm7Zu7tTTEKZZbUlmtY0enrwECgU';

    constructor(
        private swPush: SwPush,
        private newsletterService: NewsletterService) {

    }

    ngOnInit() {
    }


    subscribeToNotifications() {
        this.swPush.requestSubscription({
            serverPublicKey: this.VAPID_PUBLIC_KEY
        })
            .then(sub => {

                this.sub = sub;

                console.log('Notificacion Subcripcion', sub);
                this.newsletterService.addPushSubscriber(sub).subscribe(
                    () => console.log('Enviar push notificacion al servidor.'),
                    err => console.log('No se pudo enviar la subcripción al servidor, razón: ', err)
                );
            })
            .catch(err => console.error('No se puede subcribir a las notificaciones', err));


    }


    sendNewsletter() {
        console.log('Enviando notificacion a todos los subcriptores...');
        this.newsletterService.send().subscribe();

    }



}
