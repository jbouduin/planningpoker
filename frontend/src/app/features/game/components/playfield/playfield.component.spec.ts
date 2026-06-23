import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayfieldComponent } from './playfield.component';

describe('PlayfieldComponent', () => {
  let component: PlayfieldComponent;
  let fixture: ComponentFixture<PlayfieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayfieldComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PlayfieldComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
