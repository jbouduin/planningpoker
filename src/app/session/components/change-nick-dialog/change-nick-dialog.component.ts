import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-change-nick-dialog',
  templateUrl: './change-nick-dialog.component.html',
  styleUrls: ['./change-nick-dialog.component.scss']
})
export class ChangeNickDialogComponent {

  //#region private properties ------------------------------------------------
  private readonly dialogRef: MatDialogRef<ChangeNickDialogComponent>;
  private readonly formBuilder: FormBuilder;
  private readonly translateService: TranslateService;
  //#endregion

  //#region Public properties -------------------------------------------------
  public formData: FormGroup;
  //#endregion

  //#region label getters -----------------------------------------------------
  public get cancelButtonLabel(): string {
    return this.translateService.instant('Dialog.ButtonLabel.Cancel');
  }

  public get nickNameLabel(): string {
    return this.translateService.instant('Home.Component.InputLabel.NickName');
  }

  public get nickNamePlaceHolder(): string {
    return this.translateService.instant('Home.Component.InputPlaceholder.NickName');
  }

  public get saveButtonLabel(): string {
    return this.translateService.instant('Dialog.ButtonLabel.Save');
  }

  public get title(): string {
    return this.translateService.instant('Dialog.Change-nick.Title');
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(dialogRef: MatDialogRef<ChangeNickDialogComponent>, formBuilder: FormBuilder, translateService: TranslateService) {
    this.dialogRef = dialogRef;
    this.formBuilder = formBuilder;
    this.translateService = translateService;
    this.formData = this.formBuilder.group({
      nick: new FormControl('', [Validators.required])
    });
  }
  //#region

  //#region UI triggers -------------------------------------------------------
  public cancel(): void {
    this.dialogRef.close();
  }

  public save(): void {
    this.dialogRef.close(this.formData.get('nick')?.value);
  }

  public getErrorMessage(name: string): string | undefined {
    const formControl = this.formData.get(name);
    if (formControl?.hasError('required')) {
      return this.translateService.instant('Input.Error.Mandatory');
    }
    return undefined;
  }
  //#endregion
}
