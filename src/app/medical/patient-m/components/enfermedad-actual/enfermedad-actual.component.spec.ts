import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnfermedadActualComponent } from './enfermedad-actual.component';

describe('EnfermedadActualComponent', () => {
  let component: EnfermedadActualComponent;
  let fixture: ComponentFixture<EnfermedadActualComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnfermedadActualComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnfermedadActualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
