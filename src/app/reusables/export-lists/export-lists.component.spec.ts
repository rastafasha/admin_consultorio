import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportListsComponent } from './export-lists.component';

describe('ExportListsComponent', () => {
  let component: ExportListsComponent;
  let fixture: ComponentFixture<ExportListsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExportListsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExportListsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
