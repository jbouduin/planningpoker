import { ICard } from '@shared-lib';

export class Card {
  //#region private properties ------------------------------------------------
  private readonly card: ICard;
  //#endregion

  //#region getters -----------------------------------------------------------
  public get index(): number {
    return this.card.index;
  }

  public get label(): string {
    return this.card.label;
  }

  public get isIcon(): boolean {
    return this.card.isIcon;
  }

  public get isUnknownEstimation(): boolean {
    return this.card.isUnknownEstimation;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(card: ICard) {
    this.card = card;
  }
  //#endregion
}
