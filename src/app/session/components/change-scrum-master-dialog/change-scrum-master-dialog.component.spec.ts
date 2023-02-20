import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeScrumMasterDialogComponent } from './change-scrum-master-dialog.component';

describe('ChangeScrumMasterDialogComponent', () => {
  let component: ChangeScrumMasterDialogComponent;
  let fixture: ComponentFixture<ChangeScrumMasterDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChangeScrumMasterDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangeScrumMasterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
