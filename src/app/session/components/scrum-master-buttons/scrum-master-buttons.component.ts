import { Component } from '@angular/core';
import { PokerService } from '@app/session/services/poker.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'session-scrum-master-buttons',
  templateUrl: './scrum-master-buttons.component.html',
  styleUrls: ['./scrum-master-buttons.component.scss']
})
export class ScrumMasterButtonsComponent {

  //#region Private Properties ------------------------------------------------
  private readonly pokerService: PokerService;
  private readonly translateService: TranslateService;
  //#endregion

  //#region getters -----------------------------------------------------------
  public get revealButtonLabel(): string {
    return this.translateService.instant('Game.Component.ButtonLabel.Reveal');
  }

  public get forceRevealButtonLabel(): string {
    return this.translateService.instant('Game.Component.ButtonLabel.ForceReveal');
  }

  public get startButtonLabel(): string {
    return this.translateService.instant('Game.Component.ButtonLabel.Start');
  }

  public get disableReveal(): boolean {
    return this.pokerService.membersWithoutEstimation.length > 0;
  }

  public get showReveal(): boolean {
    return this.pokerService.canPoker;
  }

  public get showStart(): boolean {
    return !this.pokerService.canPoker;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(pokerService: PokerService, translateService: TranslateService) {
    this.pokerService = pokerService;
    this.translateService = translateService;
  }
  //#endregion

  //#region UI triggered methods ----------------------------------------------
  public reveal(): void {
    this.pokerService.reveal();
  }

  public start(): void {
    this.pokerService.start();
  }
  //#endregion
}
