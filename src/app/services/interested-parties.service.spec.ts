import { TestBed } from '@angular/core/testing';

import { InterestedPartiesService } from './interested-parties.service';

describe('InterestedPartiesService', () => {
  let service: InterestedPartiesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InterestedPartiesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
