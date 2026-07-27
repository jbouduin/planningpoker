import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageDialogComponent } from './message-dialog.component';

describe('Snackbar', () => {
  let component: MessageDialogComponent;

  let fixture: ComponentFixture<MessageDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageDialogComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MessageDialogComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
