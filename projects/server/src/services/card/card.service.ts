import { injectable, inject } from 'inversify';

import { DtoCard } from '../../../../shared-lib/lib';

export interface ICardService {
  generateCardSet(): Array<DtoCard>;
}

@injectable()
export class CardService implements ICardService {


  // <editor-fold desc='Constructor & C°'>
  public constructor() { }
  // </editor-fold>

  // <editor-fold desc='Interface members'>
  public generateCardSet(): Array<DtoCard> {
    const result = new Array<DtoCard>();
    result.push({ index: 0, label: '0' });
    result.push({ index: 1, label: '0.5' });
    result.push({ index: 2, label: '1' });
    result.push({ index: 3, label: '2' });
    result.push({ index: 4, label: '3' });
    result.push({ index: 5, label: '8' });
    result.push({ index: 6, label: '12' });
    result.push({ index: 7, label: '20' });
    result.push({ index: 8, label: '40' });
    result.push({ index: 9, label: '100' });
    result.push({ index: 10, label: '1000' });
    result.push({ index: 11, label: '?' });

    return result;
  }
  // </editor-fold>
}
