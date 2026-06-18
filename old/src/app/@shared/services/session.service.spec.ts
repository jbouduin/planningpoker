import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { ErrorHandlerService } from './error-handler.service';
import { HttpService } from './http.service';
import { LocalStorageService } from './local-storage.service';

import { SessionService } from './session.service';
import { SnackbarService } from './snackbar.service';

describe('SessionService', () => {
  let service: SessionService;

  const httpService = {
    checkCanRejoin(_teamName: string, _participantId: string): Observable<boolean> {
      return of(true);
    }
  }
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        RouterTestingModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: HttpService, useValue: httpService },
        { provide: ErrorHandlerService, useValue: {} },
        { provide: LocalStorageService, useValue: {} },
        { provide: SnackbarService, useValue: {}}
      ]
    });
    service = TestBed.inject(SessionService);
  });

  it('SessionService should be created', () => {
    expect(service).toBeTruthy();
  });
});
