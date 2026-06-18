import { TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../../material.module';
import { MessageBoxComponent } from './message-box.component';

describe('MessageBoxComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MessageBoxComponent
      ],
      imports: [
        MaterialModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: MatDialogRef, useFactory: () => jasmine.createSpyObj('MatDialogRef', ['close']) },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();
  });

  it('MessageBoxComponent should be created', () => {
    const fixture = TestBed.createComponent(MessageBoxComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});