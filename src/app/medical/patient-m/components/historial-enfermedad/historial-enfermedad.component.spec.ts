import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialEnfermedadComponent } from './historial-enfermedad.component';

describe('HistorialEnfermedadComponent', () => {
  let component: HistorialEnfermedadComponent;
  let fixture: ComponentFixture<HistorialEnfermedadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialEnfermedadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorialEnfermedadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
