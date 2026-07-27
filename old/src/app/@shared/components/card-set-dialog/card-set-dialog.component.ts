import { AfterViewInit, Component, Inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

import { ECardSet, ICard, ICardSet } from '@shared-lib';
import { HttpService } from '@shared/services/http.service';
import { CardSetService, ICardSetSelectItem } from '../../services/card-set.service';
import { Card } from '../card/card';
import { ICardSetDialogParams } from './card-set-dialog.params';


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
  private readonly params: ICardSetDialogParams;
  private readonly translateService: TranslateService;
  private cardSets: Array<ICardSet>;
  private _cardSetSelectItems: Array<ICardSetSelectItem>;
  private _cardSelectItems: Array<ICardSelectItem>;
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
    return this.translateService.instant('CardSetDialog.Component.Title');
  }

  public get cardSetLabel(): string {
    return this.translateService.instant('Component.Select.CardSet.Label');
  }

  public get cardSelectionError(): string {
    return this.translateService.instant('CardSetDialog.Component.SelectionError');
  }
  //#endregion

  //#region value Getters -----------------------------------------------------
  public get selectableCards(): Array<ICardSelectItem> {
    return this._cardSelectItems;
  }

  public get cardSetValues(): Array<ICardSetSelectItem> {
    return this._cardSetSelectItems;
  }

  public get noCardsSelected(): boolean {
    return this._cardSelectItems.length > 0 &&
      this._cardSelectItems.filter((card: ICardSelectItem) => card.selected && card.card.isEstimation).length < 2
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    cardSetService: CardSetService,
    @Inject(MAT_DIALOG_DATA) params: ICardSetDialogParams,
    dialogRef: MatDialogRef<CardSetDialogComponent>,
    formBuilder: FormBuilder,
    httpService: HttpService,
    translateService: TranslateService) {
    this.cardSetService = cardSetService;
    this.dialogRef = dialogRef;
    this.httpService = httpService;
    this.params = params;
    this.translateService = translateService;
    this.cardSets = new Array<ICardSet>();
    this._cardSetSelectItems = new Array<ICardSetSelectItem>();
    this._cardSelectItems = new Array<ICardSelectItem>();
    this.cardSetControl = new FormControl(this.params.currentCardSet || ECardSet.Cohn, [Validators.required]);
    this.cardSetControl.valueChanges.subscribe((value: ECardSet | null) => this.selectedCardSetChanged(value));
    this.formData = formBuilder.group({ cardSet: this.cardSetControl });
  }
  //#region

  //#region Angular lifecycle methods -----------------------------------------
  public ngAfterViewInit(): void {
    this.httpService.getAllCardSets().subscribe((cardSets: Array<ICardSet>) => {
      this._cardSetSelectItems = this.cardSetService.getCardSetSelectItems(...cardSets.map((cardSet: ICardSet) => cardSet.cardSet));
      this.cardSets = cardSets;
      this.cardSetControl.patchValue(this.params.currentCardSet || ECardSet.Cohn);
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
    const cardsInUse = this._cardSelectItems
      .filter((card: ICardSelectItem) => card.selected)
      .map((card: ICardSelectItem) => {
        return {
          index: card.card.index,
          label: card.card.label,
          isIcon: card.card.isIcon,
          isUnknownEstimation: card.card.isUnknownEstimation,
          isEstimation: card.card.isEstimation
        };
      })
    const result: ICardSet = {
      cardSet: this.cardSetControl.value,
      cards: cardsInUse
    }
    this.dialogRef.close(result);
  }

  public getErrorMessage(name: string): string | undefined {
    const formControl = this.formData.get(name);
    if (formControl?.hasError('required')) {
      return this.translateService.instant('Component.Error.Mandatory');
    }
    return undefined;
  }

  public selectedCardSetChanged(value: ECardSet | null): void {
    if (value) {
      const selectedSet = this.cardSets.find((set: ICardSet) => set.cardSet === value);
      if (selectedSet) {
        this._cardSelectItems = selectedSet.cards.map((card: ICard) => {
          const wasSelected = this.params.currentCards !== null && this.params.currentCardSet === value ?
            this.params.currentCards.findIndex((c: ICard) => c.index === card.index) >= 0 : true;
          return { selected: wasSelected, card: new Card(card) };
        });
      }
    }
  }
  //#endregion
}
