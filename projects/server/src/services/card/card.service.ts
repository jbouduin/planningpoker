import { injectable } from 'inversify';

import { ICard } from '../../../../shared-lib/lib';

export interface ICardService {
  readonly unknownEstimationIndex: number;
  generateCardSet(): Array<ICard>;

}

@injectable()
export class CardService implements ICardService {

  //#region Interface properties ----------------------------------------------
  public unknownEstimationIndex = 11;
  //#endregion

  //#region Interface members -------------------------------------------------
  public generateCardSet(): Array<ICard> {
    const result = new Array<ICard>();
    result.push({ index: 0, label: '0', isIcon: false, isUnknownEstimation: false });
    result.push({ index: 1, label: '0.5', isIcon: false, isUnknownEstimation: false });
    result.push({ index: 2, label: '1', isIcon: false, isUnknownEstimation: false });
    result.push({ index: 3, label: '2', isIcon: false, isUnknownEstimation: false });
    result.push({ index: 4, label: '3', isIcon: false, isUnknownEstimation: false });
    result.push({ index: 5, label: '8', isIcon: false, isUnknownEstimation: false });
    result.push({ index: 6, label: '12', isIcon: false, isUnknownEstimation: false });
    result.push({ index: 7, label: '20', isIcon: false, isUnknownEstimation: false });
    result.push({ index: 8, label: '40', isIcon: false, isUnknownEstimation: false });
    result.push({ index: 9, label: '100', isIcon: false, isUnknownEstimation: false });
    result.push({ index: 10, label: '1000', isIcon: false, isUnknownEstimation: false });
    result.push({ index: 11, label: '?', isIcon: false, isUnknownEstimation: true });
    result.push({ index: 12, label: 'local_cafe', isIcon: true, isUnknownEstimation: false });
    return result;
  }
  //#endregion
}
