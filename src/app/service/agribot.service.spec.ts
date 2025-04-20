import { TestBed } from '@angular/core/testing';

import { AgribotService } from './agribot.service';

describe('AgribotService', () => {
  let service: AgribotService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AgribotService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
