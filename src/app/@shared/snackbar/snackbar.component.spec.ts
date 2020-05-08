import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SnackbarInfoComponent } from './snackbar-info.component';

describe('SnackbarInfoComponent', () => {
  let component: SnackbarInfoComponent;
  let fixture: ComponentFixture<SnackbarInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SnackbarInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SnackbarInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
