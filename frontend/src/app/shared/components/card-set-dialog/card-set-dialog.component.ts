import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, computed, inject, signal, Signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe } from '@ngx-translate/core';
import { CardDto, CardSetDto, ECardSetType } from 'shared-lib';
import { CardSetSelectItem, CardSetService, extract } from '../../../core';
import { AppTranslationKeys } from '../app-translation-keys';
import { CardComponent } from '../card/card.component';
import { IDisplayCard } from '../card/display-card';
import { CardSetDialogComponentParams } from './card-set-dialog.component.params';

@Component({
  selector: 'app-card-set-dialog',
  imports: [
    CommonModule,
    CardComponent,
    FormsModule,
    MatFormFieldModule,
    MatDialogModule,
    MatOptionModule,
    MatSelectModule,
    ReactiveFormsModule,
    TranslatePipe
  ],
  templateUrl: './card-set-dialog.component.html',
  styleUrl: './card-set-dialog.component.scss'
})
export class CardSetDialogComponent implements AfterViewInit {
  //#region Private Fields ----------------------------------------------------
  private readonly cardSetSvc: CardSetService;
  private readonly dialogRef: MatDialogRef<CardSetDialogComponent, CardSetDto | null>;
  private readonly params: CardSetDialogComponentParams;
  private readonly cardSets: Array<CardSetDto>;
  private readonly cardSetControl: FormControl;
  //#endregion

  //#region Private Signals ---------------------------------------------------
  private selectableCards: WritableSignal<Array<CardDto>>;
  private selectedIndices: WritableSignal<Array<number>>;
  //#endregion

  //#region Protected Fields: Translation Keys --------------------------------
  protected CARD_SELECTION_ERROR = extract('Enum.EErrorCode.MoreThanTwoEstimationCardsRequired');
  protected DIALOG_TITLE = extract('CardSetDialog.Title');
  protected translationKeys = AppTranslationKeys;
  //#endregion

  //#region Protected Fields --------------------------------------------------
  protected cardSetSelectItems: Array<CardSetSelectItem>;
  protected formData: FormGroup;
  //#endregion

  //#region Signals -----------------------------------------------------------
  protected displayCards: Signal<Array<IDisplayCard>>;
  protected canSave: Signal<boolean>;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    // --- Dependency injection ---
    this.params = inject(MAT_DIALOG_DATA) as CardSetDialogComponentParams;
    this.dialogRef = inject(MatDialogRef<CardSetDialogComponent, CardSetDto | null>) as MatDialogRef<
      CardSetDialogComponent,
      CardSetDto | null
    >;
    this.cardSetSvc = inject(CardSetService);
    const formBuilder = inject(FormBuilder);

    // --- Initialize fields ---
    this.cardSets = this.cardSetSvc.allCardSets;
    this.cardSetSelectItems = this.cardSetSvc.getCardSetSelectItems(false);
    this.cardSetControl = new FormControl(this.params.currentCardSet.cardSet || ECardSetType.Cohn, [
      Validators.required
    ]);
    this.cardSetControl.valueChanges.subscribe((value: ECardSetType | null) => this.selectedCardSetChanged(value));
    this.formData = formBuilder.group({ cardSet: this.cardSetControl });

    // --- Initialize Signal ---
    this.selectableCards = signal<Array<CardDto>>(new Array());
    this.selectedIndices = signal<Array<number>>(this.params.currentCardSet.cards.map((c: CardDto) => c.index));
    this.canSave = computed(
      () =>
        this.displayCards().filter(
          (c: IDisplayCard) =>
            c.card !== null && this.selectedIndices().includes(c.card.index) && c.card?.isEstimation === true
        ).length >= 2
    );
    this.displayCards = computed(() => {
      const selectableCards = this.selectableCards();
      const selectedIndices = this.selectedIndices();
      return this.calculateDisplayedCards(selectableCards, selectedIndices);
    });
  }

  public ngAfterViewInit(): void {
    this.cardSetControl.patchValue(this.params.currentCardSet.cardSet || ECardSetType.Cohn);
  }
  //#endregion

  //#region Auxiliary Methods -------------------------------------------------
  public cardClicked(card: IDisplayCard): void {
    const idx: CardDto | null = card.card;
    if (idx !== null) {
      this.selectedIndices.update((prev: Array<number>) => {
        if (prev.includes(idx.index)) {
          return prev.filter((i: number) => i !== idx.index);
        } else {
          return [...prev, idx.index];
        }
      });
    }
  }

  public cancel(): void {
    this.dialogRef.close(null);
  }

  public save(): void {
    const selectedCards = this.selectedIndices();
    const cardsInUse = this.selectableCards().filter((card: CardDto) => selectedCards.includes(card.index));

    const result: CardSetDto = {
      cardSet: this.cardSetControl.value as ECardSetType,
      cards: cardsInUse
    };
    this.dialogRef.close(result);
  }

  public getErrorMessage(name: string): string | undefined {
    const formControl = this.formData.get(name);
    if (formControl?.hasError('required')) {
      return this.translationKeys.INPUT_ERROR_MANDATORY;
    }
    return undefined;
  }

  private selectedCardSetChanged(value: ECardSetType | null): void {
    if (value) {
      const selectedSet = this.cardSets.find((set: CardSetDto) => set.cardSet === value);
      if (selectedSet) {
        this.selectableCards.set([...selectedSet.cards]);
      }
    }
  }

  private calculateDisplayedCards(availableCards: Array<CardDto>, selectedIndices: Array<number>): Array<IDisplayCard> {
    return availableCards.map((c: CardDto) => {
      const result: IDisplayCard = {
        isAvailable: true,
        card: c,
        enabled: !c.isUnknownEstimation,
        intent: selectedIndices.includes(c.index) || c.isUnknownEstimation ? 'primary' : 'none',
        member: null
      };
      return result;
    });
  }
  //#endregion
}
