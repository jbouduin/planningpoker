import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateJoinForm } from './create-join-form';

describe('CreateJoinForm', () => {
  let component: CreateJoinForm;
  let fixture: ComponentFixture<CreateJoinForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateJoinForm],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateJoinForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
