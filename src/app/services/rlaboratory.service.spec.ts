import { TestBed } from '@angular/core/testing';

import { RLaboratoryService } from './rlaboratory.service';

describe('RLaboratoryService', () => {
  let service: RLaboratoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RLaboratoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
