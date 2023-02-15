import { Component, Inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { CardSetService, ICardSetSelectItem } from '@app/@shared/services/card-set.service';
import { ECardSet } from '@shared-lib';

@Component({
  selector: 'app-change-card-set-dialog',
  templateUrl: './change-card-set-dialog.component.html',
  styleUrls: ['./change-card-set-dialog.component.scss']
})
export class ChangeCardSetDialogComponent implements OnDestroy{

  //#region private properties ------------------------------------------------
  private readonly cardSetService: CardSetService;
  private readonly dialogRef: MatDialogRef<ChangeCardSetDialogComponent>;
  private readonly formBuilder: FormBuilder;
  private readonly languageChangeSubscription: Subscription;
  private readonly translateService: TranslateService;
  private readonly cardSets: Array<ECardSet>;
  private _cardSetValues: Array<ICardSetSelectItem>;
  //#endregion

  //#region Public properties -------------------------------------------------
  public formData: FormGroup;
  //#endregion

  //#region label getters -----------------------------------------------------
  public get cancelButtonLabel(): string {
    return this.translateService.instant('Button.Generic.Label.Cancel');
  }

  public get cardSetValues(): Array<ICardSetSelectItem> {
    return this._cardSetValues;
  }

  public get scrumMasterLabel(): string {
    return this.translateService.instant('Dialog.Change-Card-Set.InputLabel.Card-set');
  }

  public get scrumMasterPlaceHolder(): string {
    return this.translateService.instant('Dialog.Change-Card-Set.Placeholder.Card-set');
  }

  public get saveButtonLabel(): string {
    return this.translateService.instant('Button.Generic.Label.Save');
  }

  public get title(): string {
    return this.translateService.instant('Dialog.Change-Card-Set.Title');
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    cardSetService: CardSetService,
    dialogRef: MatDialogRef<ChangeCardSetDialogComponent>,
    formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) params: Array<ECardSet>,
    translateService: TranslateService) {
    this.cardSetService = cardSetService;
    this.dialogRef = dialogRef;
    this.formBuilder = formBuilder;
    this.cardSets = params;
    this.translateService = translateService;
    this._cardSetValues = this.cardSetService.getCardSetSelectItems(...this.cardSets);
    this.formData = this.formBuilder.group({
      nick: new FormControl('', [Validators.required])
    });
    this.languageChangeSubscription = this.translateService.onLangChange
      .subscribe((_event: LangChangeEvent) => this._cardSetValues = this.cardSetService.getCardSetSelectItems(...this.cardSets));
  }

  public ngOnDestroy() {
    if (this.languageChangeSubscription) {
      this.languageChangeSubscription.unsubscribe();
    }
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
