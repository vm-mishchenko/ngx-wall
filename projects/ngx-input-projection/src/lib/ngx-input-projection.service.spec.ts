import { TestBed } from '@angular/core/testing';

import { NgxInputProjectionService } from './ngx-input-projection.service';

describe('NgxInputProjectionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NgxInputProjectionService = TestBed.get(NgxInputProjectionService);
    expect(service).toBeTruthy();
  });
});
