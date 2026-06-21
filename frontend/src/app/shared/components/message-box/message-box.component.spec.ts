import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageBoxComponent } from './message-box.component';

describe('Snackbar', () => {
  let component: MessageBoxComponent;

  let fixture: ComponentFixture<MessageBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessageBoxComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MessageBoxComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
