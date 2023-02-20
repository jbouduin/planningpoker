import { Component, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

import { Member } from '@shared/services';

@Component({
  selector: 'session-change-scrum-master-dialog',
  templateUrl: './change-scrum-master-dialog.component.html',
  styleUrls: ['./change-scrum-master-dialog.component.scss']
})
export class ChangeScrumMasterDialogComponent {

  //#region private properties ------------------------------------------------
  private readonly dialogRef: MatDialogRef<ChangeScrumMasterDialogComponent>;
  private readonly translateService: TranslateService;
  private readonly teamMembers: Array<Member>;
  //#endregion

  //#region Public properties -------------------------------------------------
  public formData: FormGroup;
  //#endregion

  //#region label getters -----------------------------------------------------
  public get cancelButtonLabel(): string {
    return this.translateService.instant('Button.Generic.Label.Cancel');
  }

  public get otherMembers(): Array<Member> {
    return this.teamMembers;
  }

  public get scrumMasterLabel(): string {
    return this.translateService.instant('ChangeScrumMasterDialog.Select.ScrumMaster.Label');
  }

  public get scrumMasterPlaceHolder(): string {
    return this.translateService.instant('ChangeScrumMasterDialog.Select.ScrumMaster.PlaceHolder');
  }

  public get saveButtonLabel(): string {
    return this.translateService.instant('Button.Generic.Label.Save');
  }

  public get title(): string {
    return this.translateService.instant('ChangeScrumMasterDialog.Component.Title');
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    dialogRef: MatDialogRef<ChangeScrumMasterDialogComponent>,
    formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) params: Array<Member>,
    translateService: TranslateService) {
    this.dialogRef = dialogRef;
    this.teamMembers = params;
    this.translateService = translateService;
    this.formData = formBuilder.group({
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
      return this.translateService.instant('Component.Error.Mandatory');
    }
    return undefined;
  }
  //#endregion
}
