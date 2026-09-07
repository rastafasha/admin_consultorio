import { TestBed } from '@angular/core/testing';

import { OdontogramaService } from './odontograma.service';

describe('OdontogramaService', () => {
  let service: OdontogramaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OdontogramaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
