import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresupuestoDoctorListComponent } from './presupuesto-doctor-list.component';

describe('PresupuestoDoctorListComponent', () => {
  let component: PresupuestoDoctorListComponent;
  let fixture: ComponentFixture<PresupuestoDoctorListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PresupuestoDoctorListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PresupuestoDoctorListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
