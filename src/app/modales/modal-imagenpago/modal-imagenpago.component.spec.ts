import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalImagenpagoComponent } from './modal-imagenpago.component';

describe('ModalImagenpagoComponent', () => {
  let component: ModalImagenpagoComponent;
  let fixture: ComponentFixture<ModalImagenpagoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalImagenpagoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalImagenpagoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
