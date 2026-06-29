import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectParticipantDialogComponent } from './select-participant-dialog.component';

describe('SelectParticipantDialogComponent', () => {
  let component: SelectParticipantDialogComponent;
  let fixture: ComponentFixture<SelectParticipantDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectParticipantDialogComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SelectParticipantDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
