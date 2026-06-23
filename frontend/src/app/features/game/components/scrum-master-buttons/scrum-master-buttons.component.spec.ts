import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScrumMasterButtonsComponent } from './scrum-master-buttons.component';

describe('ScrumMasterButtonsComponent', () => {
  let component: ScrumMasterButtonsComponent;
  let fixture: ComponentFixture<ScrumMasterButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScrumMasterButtonsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ScrumMasterButtonsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
