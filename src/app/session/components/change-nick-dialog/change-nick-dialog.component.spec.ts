import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeNickDialogComponent } from './change-nick-dialog.component';

describe('ChangeNickDialogComponent', () => {
  let component: ChangeNickDialogComponent;
  let fixture: ComponentFixture<ChangeNickDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChangeNickDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangeNickDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
