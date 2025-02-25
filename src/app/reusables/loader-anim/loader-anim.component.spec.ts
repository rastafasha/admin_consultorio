import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoaderAnimComponent } from './loader-anim.component';

describe('LoaderAnimComponent', () => {
  let component: LoaderAnimComponent;
  let fixture: ComponentFixture<LoaderAnimComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoaderAnimComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoaderAnimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
