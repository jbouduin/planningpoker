import { TestBed, waitForAsync } from '@angular/core/testing';
import { CardSetDialogComponent } from './card-set-dialog.component';
import { TranslateModule } from '@ngx-translate/core';
import { SnackbarService } from '../../services/snackbar.service';
import { MaterialModule } from '../../../material.module';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpService } from '../../services/http.service';
import { CardSetService } from '../../services/card-set.service';
import { ReactiveFormsModule } from '@angular/forms';

describe('CardSetDialogComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        CardSetDialogComponent
      ],
      imports: [
        TranslateModule.forRoot(),
        MaterialModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: CardSetService, useFactory: () => jasmine.createSpyObj('CardSetService', ['getCardSetSelectItems']) },
        { provide: MatDialogRef, useFactory: () => jasmine.createSpyObj('MatDialogRef', ['close']) },
        { provide: HttpService, useFactory: () => jasmine.createSpyObj('HttpService', ['getAllCardSets']) },
        { provide: SnackbarService, useFactory: () => jasmine.createSpyObj<SnackbarService>('SnackbarService', ['showError', 'showInfo', 'showWarning']) }, //  useClass: snackbarServiceStub },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();
  }));

  it('CardSetDialogComponent should be created', () => {
    const fixture = TestBed.createComponent(CardSetDialogComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

});