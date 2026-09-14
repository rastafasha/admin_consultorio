import { TestBed } from '@angular/core/testing';

import { TasapersonalizadaService } from './tasapersonalizada.service';

describe('TasapersonalizadaService', () => {
  let service: TasapersonalizadaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TasapersonalizadaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
