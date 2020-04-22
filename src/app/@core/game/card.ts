import { DtoCard } from '../../../../projects/shared-lib/lib';

export class Card {
  // <editor-fold desc='Public get methods'>
  public get index(): number {
    return this.cardIndex;
  }

  public get label(): string {
    return this.cardLabel;
  }
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public static createCard(dtoCard: DtoCard): Card {
    return new Card(dtoCard.index, dtoCard.label);
  }

  private constructor(private cardIndex: number, private cardLabel: string) { }
  // </editor-fold>
}
