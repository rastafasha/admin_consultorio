import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientDoctorListComponent } from './patient-doctor-list.component';

describe('PatientDoctorListComponent', () => {
  let component: PatientDoctorListComponent;
  let fixture: ComponentFixture<PatientDoctorListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientDoctorListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientDoctorListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
