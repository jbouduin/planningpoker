import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from 'src/app/material.module';

import { SnackbarService } from './snackbar.service';

describe('SnackbarService', () => {
  let service: SnackbarService;
  // let matSnackBar: MatSnackBar;

  /* eslint-disable @typescript-eslint/no-empty-function */
  const mockMatSnackBar = {
    open: () => { }
  };
  /* eslint-enable @typescript-eslint/no-empty-function */

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule
      ],
      providers: [
        SnackbarService,
        { provide: MatSnackBar, useValue: mockMatSnackBar }
      ]
    });

    service = TestBed.inject(SnackbarService);
    // matSnackBar = TestBed.inject(MatSnackBar);
  });

  it('SnackbarService should be created', () => {
    expect(service).toBeTruthy();
  });


});
