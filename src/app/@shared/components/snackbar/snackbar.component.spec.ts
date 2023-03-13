import { TestBed } from '@angular/core/testing';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { MaterialModule } from '../../../material.module';
import { SnackbarComponent } from './snackbar.component';

describe('SnackbarComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        SnackbarComponent
      ],
      imports: [
        MaterialModule
      ],
      providers: [
        { provide: MatSnackBarRef, useFactory: () => jasmine.createSpyObj('MatSnackBarRef', ['dismiss']) },
        { provide: MAT_SNACK_BAR_DATA, useValue: {}}
      ]
    }).compileComponents();
  });

  it('SnackbarComponent should be created', () => {
    const fixture = TestBed.createComponent(SnackbarComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});