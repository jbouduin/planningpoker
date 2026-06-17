import { TestBed } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';

import { ErrorHandlerService } from './error-handler.service';
import { SnackbarService } from './snackbar.service';

describe('ErrorHandlerService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        MatSnackBarModule
      ],
      providers: [
        { provide: SnackbarService, useFactory: () => jasmine.createSpyObj('SnackbarService', ['showError', 'showInfo', 'showWarning'])}
      ]
    });

  });

  it('ErrorHandlerService should be created', () => {
    const service = TestBed.inject(ErrorHandlerService);
    expect(service).toBeTruthy();
  });
});
