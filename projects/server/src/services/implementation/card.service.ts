import { injectable } from 'inversify';

import { ECardSet, ICard, ICardSet } from '../../../../shared-lib/src';
import { ICardService } from '../interfaces';

@injectable()
export class CardService implements ICardService {

  //#region private properties ------------------------------------------------
  private cardSets: Map<ECardSet, ICardSet>;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    this.cardSets = new Map<ECardSet, ICardSet>();
  }
  //#endregion

  //#region Interface members -------------------------------------------------
  public getCardSet(set: ECardSet): ICardSet {
    let result = this.cardSets.get(set);
    if (!result) {
      let cards: Array<ICard>;
      switch (set) {
        case ECardSet.Fibonacci:
          cards = this.generateFibonacci();
          break;
        case ECardSet.TShirt:
          cards = this.generateShirts();
          break;
        case ECardSet.Cohn:
        default:
          cards = this.generateCohn();
          break;
      }
      result = {
        cardSet: set,
        cards: cards,
        unknownEstimationIndex: cards.findIndex((card: ICard) => card.isUnknownEstimation)
      }
      this.cardSets.set(set, result);
    }
    return result;
  }
  //#endregion

  //#region private methods ---------------------------------------------------
  private generateCohn(): Array<ICard> {
    let idx = 0;
    return [
      { index: idx++, label: '0', isIcon: false, isUnknownEstimation: false },
      { index: idx++, label: '0.5', isIcon: false, isUnknownEstimation: false },
      { index: idx++, label: '1', isIcon: false, isUnknownEstimation: false },
      { index: idx++, label: '2', isIcon: false, isUnknownEstimation: false },
      { index: idx++, label: '3', isIcon: false, isUnknownEstimation: false },
      { index: idx++, label: '5', isIcon: false, isUnknownEstimation: false },
      { index: idx++, label: '8', isIcon: false, isUnknownEstimation: false },
      { index: idx++, label: '13', isIcon: false, isUnknownEstimation: false },
      { index: idx++, label: '20', isIcon: false, isUnknownEstimation: false },
      { index: idx++, label: '40', isIcon: false, isUnknownEstimation: false },
      { index: idx++, label: '100', isIcon: false, isUnknownEstimation: false },
      { index: idx++, label: '1000', isIcon: false, isUnknownEstimation: false },
      { index: idx++, label: '?', isIcon: false, isUnknownEstimation: true },
      { index: idx++, label: 'local_cafe', isIcon: true, isUnknownEstimation: false }
    ];
  }

  private generateFibonacci(): Array<ICard> {
    let idx = 0;
    return [
      { index: idx++, label: '0', isIcon: false, isUnknownEstimation: false },
      { index: idx++, label: '1', isIcon: false, isUnknownEstimation: false },
      { index: idx++, label: '2', isIcon: false, isUnknownEstimation: false },
      { index: idx++, label: '3', isIcon: false, isUnknownEstimation: false },
      { index: idx++, label: '5', isIcon: false, isUnknownEstimation: false },
      { index: idx++, label: '8', isIcon: false, isUnknownEstimation: false },
      { index: idx++, label: '13', isIcon: false, isUnknownEstimation: false },
      { index: idx++, label: '21', isIcon: false, isUnknownEstimation: false },
      { index: idx++, label: '34', isIcon: false, isUnknownEstimation: false },
      { index: idx++, label: '55', isIcon: false, isUnknownEstimation: false },
      { index: idx++, label: '89', isIcon: false, isUnknownEstimation: false },
      { index: idx++, label: '144', isIcon: false, isUnknownEstimation: false },
      { index: idx++, label: '?', isIcon: false, isUnknownEstimation: true },
      { index: idx++, label: 'local_cafe', isIcon: true, isUnknownEstimation: false }
    ];
  }


  private generateShirts(): Array<ICard> {
    let idx = 0;
    return [
      { index: idx++, label: '0', isIcon: false, isUnknownEstimation: false },
      { index: idx++, label: 'XXXS', isIcon: false, isUnknownEstimation: false },
      { index: idx++, label: 'XXS', isIcon: false, isUnknownEstimation: false },
      { index: idx++, label: 'XS', isIcon: false, isUnknownEstimation: false },
      { index: idx++, label: 'S', isIcon: false, isUnknownEstimation: false },
      { index: idx++, label: 'M', isIcon: false, isUnknownEstimation: false },
      { index: idx++, label: 'L', isIcon: false, isUnknownEstimation: false },
      { index: idx++, label: 'XL', isIcon: false, isUnknownEstimation: false },
      { index: idx++, label: 'XXL', isIcon: false, isUnknownEstimation: false },
      { index: idx++, label: 'XXXL', isIcon: false, isUnknownEstimation: false },
      { index: idx++, label: '?', isIcon: false, isUnknownEstimation: true },
      { index: idx++, label: 'local_cafe', isIcon: true, isUnknownEstimation: false }
    ];
  }
  //#endregion
}
