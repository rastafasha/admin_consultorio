import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QraccesoComponent } from './qracceso.component';

describe('QraccesoComponent', () => {
  let component: QraccesoComponent;
  let fixture: ComponentFixture<QraccesoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QraccesoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QraccesoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
