import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberButtonsComponent } from './member-buttons.component';

describe('MemberButtonsComponent', () => {
  let component: MemberButtonsComponent;
  let fixture: ComponentFixture<MemberButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MemberButtonsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MemberButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
