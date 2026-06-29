import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardSetDialogComponent } from './card-set-dialog.component';

describe('CardSetDialogComponent', () => {
  let component: CardSetDialogComponent;
  let fixture: ComponentFixture<CardSetDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardSetDialogComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CardSetDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
