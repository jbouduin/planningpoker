import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamHeaderComponent } from './team-header.component';

describe('TeamHeaderComponent', () => {
  let component: TeamHeaderComponent;
  let fixture: ComponentFixture<TeamHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamHeaderComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TeamHeaderComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
