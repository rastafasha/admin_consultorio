import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificacionesupdateComponent } from './notificacionesupdate.component';

describe('NotificacionesupdateComponent', () => {
    let component: NotificacionesupdateComponent;
    let fixture: ComponentFixture<NotificacionesupdateComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ NotificacionesupdateComponent ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NotificacionesupdateComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});