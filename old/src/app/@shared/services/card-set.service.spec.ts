import { TestBed } from '@angular/core/testing';
import { CardSetService } from './card-set.service';
import { TranslateModule } from '@ngx-translate/core';

describe('CardSetService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot()
      ],
      providers: [
        CardSetService,
      ]
    });
  });

  it('CardSetService should be created', () => {
    const service = TestBed.inject(CardSetService);
     expect(service).toBeTruthy();
  })
});