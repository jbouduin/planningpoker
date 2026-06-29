import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';
import { extract } from '../../../core';

@Component({
  selector: 'app-change-nick-dialog',
  imports: [FormsModule, MatDialogModule, MatInputModule, MatFormFieldModule, TranslatePipe, ReactiveFormsModule],
  templateUrl: './change-nick-dialog.component.html',
  styleUrl: './change-nick-dialog.component.scss'
})
export class ChangeNickDialogComponent {
  //#region Protected Fields --------------------------------------------------
  protected dialogRef: MatDialogRef<ChangeNickDialogComponent, string>;
  protected formData: FormGroup;
  //#endregion

  //#region Getters: Labels ---------------------------------------------------
  public get cancelButtonLabel(): string {
    return extract('Button.Generic.Label.Cancel');
  }

  public get nickNameLabel(): string {
    return extract('Component.Input.Nick.Label');
  }

  public get nickNamePlaceHolder(): string {
    return extract('Component.Input.Nick.PlaceHolder');
  }

  public get saveButtonLabel(): string {
    return extract('Button.Generic.Label.Save');
  }

  public get title(): string {
    return extract('ChangeNickDialog.Component.Title');
  }
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
      return extract('Component.Error.Mandatory');
    }
    return undefined;
  }
  //#endregion
}
