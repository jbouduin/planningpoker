import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { Member } from '@shared/services';
import { Estimation } from '../../services/estimation';
import { PokerService } from '../../services/poker.service';

@Component({
  selector: 'session-poker-table',
  templateUrl: './poker-table.component.html',
  styleUrls: ['./poker-table.component.scss']
})
export class PokerTableComponent {

  //#region Private Properties ------------------------------------------------
  private pokerService: PokerService
  private translateService: TranslateService;
  //#endregion

  //#region getters -----------------------------------------------------------
  public get estimations(): Array<Estimation> {
    return this.pokerService.estimations;
  }

  public get membersWithoutEstimation(): Array<Member> {
    return this.pokerService.membersWithoutEstimation;
  }

  public get meLabel(): string {
    return this.translateService.instant('Label.Generic.Me');
  }

  public get canWithdraw(): boolean {
    return this.pokerService.canPoker;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(pokerService: PokerService, translateService: TranslateService) {
    this.pokerService = pokerService;
    this.translateService = translateService;
  }
  //#endregion

  //#region UI triggered methods ----------------------------------------------
  public cardClicked(): void {
    this.pokerService.withDraw();
  }
  //#endregion
}
