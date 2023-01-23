import { ICard } from '@shared-lib';

export class Card {
  //#region  Public get methods
  public get index(): number {
    return this.cardIndex;
  }

  public get label(): string {
    return this.cardLabel;
  }
  //#endregion

  //#region  Constructor & C°
  public static createCard(dtoCard: ICard): Card {
    return new Card(dtoCard.index, dtoCard.label);
  }

  private constructor(private cardIndex: number, private cardLabel: string) { }
  //#endregion
}
