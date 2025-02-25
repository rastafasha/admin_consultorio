import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BotonIntallPwaComponent } from './boton-intall-pwa.component';

describe('BotonIntallPwaComponent', () => {
  let component: BotonIntallPwaComponent;
  let fixture: ComponentFixture<BotonIntallPwaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BotonIntallPwaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BotonIntallPwaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
