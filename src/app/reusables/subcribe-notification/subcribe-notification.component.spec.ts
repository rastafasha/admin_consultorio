import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubcribeNotificationComponent } from './subcribe-notification.component';

describe('SubcribeNotificationComponent', () => {
  let component: SubcribeNotificationComponent;
  let fixture: ComponentFixture<SubcribeNotificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubcribeNotificationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubcribeNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
