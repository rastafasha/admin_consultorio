import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusOnlineComponent } from './status-online.component';

describe('StatusOnlineComponent', () => {
  let component: StatusOnlineComponent;
  let fixture: ComponentFixture<StatusOnlineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatusOnlineComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatusOnlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
