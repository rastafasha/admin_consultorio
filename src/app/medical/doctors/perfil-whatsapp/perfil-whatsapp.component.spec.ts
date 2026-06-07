import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfilWhatsappComponent } from './perfil-whatsapp.component';

describe('PerfilWhatsappComponent', () => {
  let component: PerfilWhatsappComponent;
  let fixture: ComponentFixture<PerfilWhatsappComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilWhatsappComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerfilWhatsappComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
