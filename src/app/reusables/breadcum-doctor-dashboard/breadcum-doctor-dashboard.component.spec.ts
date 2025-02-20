import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BreadcumDoctorDashboardComponent } from './breadcum-doctor-dashboard.component';

describe('BreadcumDoctorDashboardComponent', () => {
    let component: BreadcumDoctorDashboardComponent;
    let fixture: ComponentFixture<BreadcumDoctorDashboardComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [ BreadcumDoctorDashboardComponent ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(BreadcumDoctorDashboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});