import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresupuestoEditarComponent } from './presupuesto-editar.component';

describe('PresupuestoEditarComponent', () => {
  let component: PresupuestoEditarComponent;
  let fixture: ComponentFixture<PresupuestoEditarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PresupuestoEditarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PresupuestoEditarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
