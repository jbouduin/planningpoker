import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateJoinFormComponent } from './create-join-form.component';

describe('CreateJoinForm', () => {
  let component: CreateJoinFormComponent;
  let fixture: ComponentFixture<CreateJoinFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateJoinFormComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateJoinFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
