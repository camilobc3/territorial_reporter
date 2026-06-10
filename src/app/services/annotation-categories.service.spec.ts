import { TestBed } from '@angular/core/testing';

import { AnnotationCategoriesService } from './annotation-categories.service';

describe('AnnotationCategoriesService', () => {
  let service: AnnotationCategoriesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnnotationCategoriesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
