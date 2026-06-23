import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MembersPanelComponent } from './members-panel.component';

describe('ParticipantsPanelComponent', () => {
  let component: MembersPanelComponent;
  let fixture: ComponentFixture<MembersPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MembersPanelComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MembersPanelComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
