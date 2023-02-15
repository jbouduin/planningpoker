import { AfterViewInit, Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

import { Card, HttpService } from '@shared';
import { ECardSet, ICard, ICardSet } from '@shared-lib';
import { CardSetService, ICardSetSelectItem } from '../../services/card-set.service';

interface ICardSelectItem {
  selected: boolean;
  card: Card
}

@Component({
  selector: 'shared-card-set-dialog',
  templateUrl: './card-set-dialog.component.html',
  styleUrls: ['./card-set-dialog.component.scss']
})
export class CardSetDialogComponent implements AfterViewInit {
  //#region private properties ------------------------------------------------
  private readonly cardSetService: CardSetService;
  private readonly dialogRef: MatDialogRef<CardSetDialogComponent>;
  private readonly httpService: HttpService;
  private readonly translateService: TranslateService;
  private cardSets: Array<ICardSet>;
  private _cardSetValues: Array<ICardSetSelectItem>;
  private _cardValues: Array<ICardSelectItem>;
  private cardSetControl: FormControl;
  //#endregion

  //#region Public properties -------------------------------------------------
  public formData: FormGroup;
  //#endregion

  //#region label getters -----------------------------------------------------
  public get cancelButtonLabel(): string {
    return this.translateService.instant('Button.Generic.Label.Cancel');
  }

  public get saveButtonLabel(): string {
    return this.translateService.instant('Button.Generic.Label.OK');
  }

  public get title(): string {
    return this.translateService.instant('Dialog.Customize-card-set.Title');
  }

  public get cardSetLabel(): string {
    return this.translateService.instant('Home.Component.SelectLabel.CardSet');
  }

  public get cardSelectionError(): string {
    return this.translateService.instant('CardSetDialog.Component.SelectionError');
  }
  //#endregion

  //#region value Getters -----------------------------------------------------
  public get selectableCards(): Array<ICardSelectItem> {
    return this._cardValues;
  }

  public get cardSetValues(): Array<ICardSetSelectItem> {
    return this._cardSetValues;
  }

  public get noCardsSelected(): boolean {
    return this._cardValues.filter((card: ICardSelectItem) => !card.card.isIcon && card.selected && !card.card.isUnknownEstimation).length < 2
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    cardSetService: CardSetService,
    dialogRef: MatDialogRef<CardSetDialogComponent>,
    formBuilder: FormBuilder,
    httpService: HttpService,
    translateService: TranslateService) {
    this.cardSetService = cardSetService;
    this.dialogRef = dialogRef;
    this.httpService = httpService;
    this.translateService = translateService;
    this.cardSets = new Array<ICardSet>();
    this._cardSetValues = new Array<ICardSetSelectItem>();
    this._cardValues = new Array<ICardSelectItem>();
    this.cardSetControl = new FormControl(ECardSet.Cohn, [Validators.required]);
    this.cardSetControl.valueChanges.subscribe((value: ECardSet | null) => this.selectedCardSetChanged(value));
    this.formData = formBuilder.group({ cardSet: this.cardSetControl });
  }
  //#region

  //#region Angular lifecycle methods -----------------------------------------
  public ngAfterViewInit(): void {
    this.httpService.getAllCardSets().subscribe((cardSets: Array<ICardSet>) => {
      this._cardSetValues = this.cardSetService.getCardSetSelectItems(...cardSets.map((cardSet: ICardSet) => cardSet.cardSet));
      this.cardSets = cardSets;
      this.cardSetControl.patchValue(ECardSet.Cohn);
    });
  }
  //#endregion

  //#region UI triggers -------------------------------------------------------
  public cardClicked(card: ICardSelectItem) {
    if (!card.card.isUnknownEstimation) {
      card.selected = !card.selected;
    }
  }

  public cancel(): void {
    this.dialogRef.close();
  }

  public save(): void {
    let unknownIndex = -1;
    const cardsInUse = this._cardValues
      .filter((card: ICardSelectItem) => card.selected)
      .map((card: ICardSelectItem) => {
        if (card.card.isUnknownEstimation) {
          unknownIndex = card.card.index;
        }
        return {
          index: card.card.index,
          label: card.card.label,
          isIcon: card.card.isIcon,
          isUnknownEstimation: card.card.isUnknownEstimation
        };
      })
    const result: ICardSet = {
      cardSet: ECardSet.Custom,
      cards: cardsInUse,
      unknownEstimationIndex: unknownIndex
    }
    this.dialogRef.close(result);
  }

  public getErrorMessage(name: string): string | undefined {
    console.log(`name ${name}`);
    const formControl = this.formData.get(name);
    if (formControl?.hasError('required')) {
      return this.translateService.instant('Input.Error.Mandatory');
    }
    return undefined;
  }

  public selectedCardSetChanged(value: ECardSet | null): void {
    if (value) {
      const selectedSet = this.cardSets.find((set: ICardSet) => set.cardSet === value);
      if (selectedSet) {
        this._cardValues = selectedSet.cards.map((card: ICard) => { return { selected: true, card: new Card(card) }; });
      }
    }
  }
  //#endregion
}
