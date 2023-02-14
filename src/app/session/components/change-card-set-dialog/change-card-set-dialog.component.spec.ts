import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeCardSetDialogComponent } from './change-card-set-dialog.component';

describe('ChangeCardSetDialogComponent', () => {
  let component: ChangeCardSetDialogComponent;
  let fixture: ComponentFixture<ChangeCardSetDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChangeCardSetDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangeCardSetDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
