import { injectable } from 'inversify';

import { ECardSet, ICardSet } from '../../../../shared-lib/lib';
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
      switch (set) {
        case ECardSet.Fibonacci:
          result = this.generateFibonacci();
          break;
        case ECardSet.TShirt:
          result = this.generateShirts();
          break;
        case ECardSet.Cohn:
        default:
          result = this.generateCohn();
          break;
      }
      this.cardSets.set(set, result);
    }
    return result;
  }
  //#endregion

  //#region private methods ---------------------------------------------------
  private generateCohn(): ICardSet {
    return {
      cardSet: ECardSet.Cohn,
      cards: [
        { index: 0, label: '0', isIcon: false, isUnknownEstimation: false },
        { index: 1, label: '0.5', isIcon: false, isUnknownEstimation: false },
        { index: 2, label: '1', isIcon: false, isUnknownEstimation: false },
        { index: 3, label: '2', isIcon: false, isUnknownEstimation: false },
        { index: 4, label: '3', isIcon: false, isUnknownEstimation: false },
        { index: 5, label: '8', isIcon: false, isUnknownEstimation: false },
        { index: 6, label: '13', isIcon: false, isUnknownEstimation: false },
        { index: 7, label: '20', isIcon: false, isUnknownEstimation: false },
        { index: 8, label: '40', isIcon: false, isUnknownEstimation: false },
        { index: 9, label: '100', isIcon: false, isUnknownEstimation: false },
        { index: 10, label: '1000', isIcon: false, isUnknownEstimation: false },
        { index: 11, label: '?', isIcon: false, isUnknownEstimation: true },
        { index: 12, label: 'local_cafe', isIcon: true, isUnknownEstimation: false }],
      unknownEstimationIndex: 11
    }
  }

  private generateFibonacci(): ICardSet {
    return {
      cardSet: ECardSet.Cohn,
      cards: [
        { index: 0, label: '0', isIcon: false, isUnknownEstimation: false },
        { index: 1, label: '1', isIcon: false, isUnknownEstimation: false },
        { index: 2, label: '2', isIcon: false, isUnknownEstimation: false },
        { index: 3, label: '3', isIcon: false, isUnknownEstimation: false },
        { index: 4, label: '5', isIcon: false, isUnknownEstimation: false },
        { index: 5, label: '8', isIcon: false, isUnknownEstimation: false },
        { index: 6, label: '13', isIcon: false, isUnknownEstimation: false },
        { index: 7, label: '21', isIcon: false, isUnknownEstimation: false },
        { index: 8, label: '34', isIcon: false, isUnknownEstimation: false },
        { index: 9, label: '55', isIcon: false, isUnknownEstimation: false },
        { index: 10, label: '89', isIcon: false, isUnknownEstimation: false },
        { index: 11, label: '?', isIcon: false, isUnknownEstimation: true },
        { index: 12, label: 'local_cafe', isIcon: true, isUnknownEstimation: false }],
      unknownEstimationIndex: 11
    }
  }

  private generateShirts(): ICardSet {
    return {
      cardSet: ECardSet.Cohn,
      cards: [
        { index: 0, label: '0', isIcon: false, isUnknownEstimation: false },
        { index: 1, label: 'XXXS', isIcon: false, isUnknownEstimation: false },
        { index: 2, label: 'XXS', isIcon: false, isUnknownEstimation: false },
        { index: 3, label: 'XS', isIcon: false, isUnknownEstimation: false },
        { index: 4, label: 'S', isIcon: false, isUnknownEstimation: false },
        { index: 5, label: 'M', isIcon: false, isUnknownEstimation: false },
        { index: 6, label: 'L', isIcon: false, isUnknownEstimation: false },
        { index: 7, label: 'XL', isIcon: false, isUnknownEstimation: false },
        { index: 8, label: 'XXL', isIcon: false, isUnknownEstimation: false },
        { index: 9, label: 'XXXL', isIcon: false, isUnknownEstimation: false },
        { index: 10, label: '?', isIcon: false, isUnknownEstimation: true },
        { index: 11, label: 'local_cafe', isIcon: true, isUnknownEstimation: false }],
      unknownEstimationIndex: 10
    }
  }
  //#endregion
}
