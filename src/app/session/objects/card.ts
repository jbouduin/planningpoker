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
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public static createCard(card: ICard): Card {
    return new Card(card);
  }

  private constructor(card: ICard) {
    this.card = card;
  }
  //#endregion
}
