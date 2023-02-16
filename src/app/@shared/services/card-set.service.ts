import { Injectable } from '@angular/core';
import { enumMarker } from '@app/@core/marker';
import { TranslateService } from '@ngx-translate/core';

// required because of ngx-translate-extract
import { ECardSet } from '../../../../projects/shared-lib/lib/interfaces/card-set.enum';

export interface ICardSetSelectItem {
  set: ECardSet;
  label: string;
}

@Injectable({
  providedIn: 'root'
})
export class CardSetService {

  //#region private properties ------------------------------------------------
  private readonly translateService: TranslateService;
  private readonly cardSetPrefix: string;
  //#endregion

  //#region Constructor -------------------------------------------------------
  constructor(translateService: TranslateService) {
    this.translateService = translateService;
    this.cardSetPrefix = enumMarker("CardSet.DisplayName.", ECardSet);
  }
  //#endregion

  //#region public methods ----------------------------------------------------
  public getCardSetSelectItems(...sets: Array<ECardSet>): Array<ICardSetSelectItem> {
    if (sets === null || sets.length === 0) {
      sets = [
        ECardSet.Cohn,
        ECardSet.Fibonacci,
        ECardSet.TShirt,
        ECardSet.Custom
      ]
    }
    return sets.map((set: ECardSet) => {
      return {
        set: set,
        label: this.translateService.instant(`${this.cardSetPrefix}${ECardSet[set]}`)
      };
    });
  }
  //#endregion
}
