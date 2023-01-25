import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokerButtonsComponent } from './poker-buttons.component';

describe('PokerButtonsComponent', () => {
  let component: PokerButtonsComponent;
  let fixture: ComponentFixture<PokerButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PokerButtonsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokerButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
