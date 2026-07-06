import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';
import { extract } from '../../../core';
import { AppTranslationKeys } from '../app-translation-keys';

@Component({
  selector: 'app-change-nick-dialog',
  imports: [FormsModule, MatDialogModule, MatInputModule, MatFormFieldModule, TranslatePipe, ReactiveFormsModule],
  templateUrl: './change-nick-dialog.component.html',
  styleUrl: './change-nick-dialog.component.scss'
})
export class ChangeNickDialogComponent {
  //#region Translation keys --------------------------------------------------
  protected readonly DIALOG_TITLE = extract('ChangeNickDialog.Title');
  protected readonly translationKeys = AppTranslationKeys;
  //#endregion

  //#region Protected Fields --------------------------------------------------
  protected dialogRef: MatDialogRef<ChangeNickDialogComponent, string>;
  protected formData: FormGroup;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(dialogRef: MatDialogRef<ChangeNickDialogComponent, string>, formBuilder: FormBuilder) {
    this.dialogRef = dialogRef;
    this.formData = formBuilder.group({
      nick: new FormControl('', [Validators.required])
    });
  }
  //#endregion

  //#region UI-Triggers -------------------------------------------------------
  public cancel(): void {
    this.dialogRef.close();
  }

  public save(): void {
    this.dialogRef.close(this.formData.get('nick')?.value);
  }

  public getErrorMessage(name: string): string | undefined {
    const formControl = this.formData.get(name);
    if (formControl?.hasError('required')) {
      return AppTranslationKeys.INPUT_ERROR_MANDATORY;
    }
    return undefined;
  }
  //#endregion
}
