import { TestBed } from '@angular/core/testing';

import { MessageDispatcherService } from './message-dispatcher.service';

describe('MessageAdapterService', () => {
  let service: MessageDispatcherService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MessageDispatcherService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
