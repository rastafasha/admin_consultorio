import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresupuestoListaComponent } from './presupuesto-lista.component';

describe('PresupuestoListaComponent', () => {
  let component: PresupuestoListaComponent;
  let fixture: ComponentFixture<PresupuestoListaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PresupuestoListaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PresupuestoListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
