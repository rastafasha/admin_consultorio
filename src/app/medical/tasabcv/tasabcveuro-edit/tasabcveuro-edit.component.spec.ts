import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TasabcveuroEditComponent } from './tasabcveuro-edit.component';

describe('TasabcveuroEditComponent', () => {
  let component: TasabcveuroEditComponent;
  let fixture: ComponentFixture<TasabcveuroEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TasabcveuroEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TasabcveuroEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
