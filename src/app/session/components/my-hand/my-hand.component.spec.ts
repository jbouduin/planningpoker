import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyHandComponent } from './my-hand.component';

describe('MyHandComponent', () => {
  let component: MyHandComponent;
  let fixture: ComponentFixture<MyHandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyHandComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyHandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
