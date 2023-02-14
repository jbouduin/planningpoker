import { TestBed } from '@angular/core/testing';

import { CardSetService } from './card-set.service';

describe('CardSetService', () => {
  let service: CardSetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardSetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
