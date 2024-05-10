import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPatientSpecialitiesComponent } from './list-patient-specialities.component';

describe('ListPatientSpecialitiesComponent', () => {
  let component: ListPatientSpecialitiesComponent;
  let fixture: ComponentFixture<ListPatientSpecialitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListPatientSpecialitiesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListPatientSpecialitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
