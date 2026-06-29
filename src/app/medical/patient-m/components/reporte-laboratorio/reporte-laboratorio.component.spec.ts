import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteLaboratorioComponent } from './reporte-laboratorio.component';

describe('ReporteLaboratorioComponent', () => {
  let component: ReporteLaboratorioComponent;
  let fixture: ComponentFixture<ReporteLaboratorioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteLaboratorioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteLaboratorioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
