import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TasapersonalizadaEditComponent } from './tasapersonalizada-edit.component';

describe('TasapersonalizadaEditComponent', () => {
  let component: TasapersonalizadaEditComponent;
  let fixture: ComponentFixture<TasapersonalizadaEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TasapersonalizadaEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TasapersonalizadaEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
