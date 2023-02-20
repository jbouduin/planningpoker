import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardSetDialogComponent } from './card-set-dialog.component';

describe('CardSetDialogComponent', () => {
  let component: CardSetDialogComponent;
  let fixture: ComponentFixture<CardSetDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardSetDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardSetDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
