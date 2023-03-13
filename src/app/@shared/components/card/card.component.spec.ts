import { TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';

describe('CardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        CardComponent
      ],
    }).compileComponents();
  });

  it('CardComponent should be created', () => {
    const fixture = TestBed.createComponent(CardComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});