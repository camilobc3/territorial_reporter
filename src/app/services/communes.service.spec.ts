import { TestBed } from '@angular/core/testing';

import { CommunesService } from './communes.service';

describe('CommunesService', () => {
  let service: CommunesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommunesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
