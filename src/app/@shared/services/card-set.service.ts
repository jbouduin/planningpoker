import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { ECardSet } from '@shared-lib';

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
  //#endregion

  //#region Constructor -------------------------------------------------------
  constructor(translateService: TranslateService) {
    this.translateService = translateService;
  }
  //#endregion

  //#region public methods ----------------------------------------------------
  public getCardSetSelectItems(...sets: Array<ECardSet>): Array<ICardSetSelectItem> {
    if (sets === null || sets.length === 0) {
      sets = [
        ECardSet.Cohn,
        ECardSet.Fibonacci,
        ECardSet.TShirt
      ]
    }
    // TODO 2343 change this if marker works again
    const result: Array<ICardSetSelectItem> = new Array<ICardSetSelectItem>();
    if (sets.indexOf(ECardSet.Cohn) >= 0) {
      result.push({ set: ECardSet.Cohn, label: this.translateService.instant('Home.Component.SelectItem.Cohn') });
    }
    if (sets.indexOf(ECardSet.Fibonacci) >= 0) {
      result.push({ set: ECardSet.Fibonacci, label: this.translateService.instant('Home.Component.SelectItem.Fibonacci') });
    }
    if (sets.indexOf(ECardSet.TShirt) >= 0) {
      result.push({ set: ECardSet.TShirt, label: this.translateService.instant('Home.Component.SelectItem.TShirt') });
    }
    return result;
  }
  //#endregion
}
