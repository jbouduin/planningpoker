import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { SessionService } from '@shared/services/session.service';
import { CardService } from '../../services/card.service';
import { PokerService } from '../../services/poker.service';

@Component({
  selector: 'session-scrum-master-buttons',
  templateUrl: './scrum-master-buttons.component.html',
  styleUrls: ['./scrum-master-buttons.component.scss']
})
export class ScrumMasterButtonsComponent {

  //#region Private Properties ------------------------------------------------
  private readonly cardService: CardService
  private readonly pokerService: PokerService;
  private readonly sessionService: SessionService;
  private readonly translateService: TranslateService;
  //#endregion

  //#region getters -----------------------------------------------------------
  public get changeCardSetButtonLabel(): string {
    return this.translateService.instant('ScrumMasterButtons.Component.Button.ChangeCardSet.Label');
  }

  public get revealButtonLabel(): string {
    return this.translateService.instant('ScrumMasterButtons.Component.Button.Reveal.Label');
  }

  public get forceRevealButtonLabel(): string {
    return this.translateService.instant('ScrumMasterButtons.Component.Button.ForceReveal.Label');
  }

  public get startButtonLabel(): string {
    return this.translateService.instant('ScrumMasterButtons.Component.Button.Start.Label');
  }

  public get disableReveal(): boolean {
    return this.pokerService.membersWithoutEstimation.length > 0;
  }

  public get showMe(): boolean {
    return this.sessionService.scrumMaster;
  }

  public get showReveal(): boolean {
    return this.pokerService.canPoker;
  }

  public get showStart(): boolean {
    return !this.pokerService.canPoker;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(cardService: CardService, pokerService: PokerService, sessionService: SessionService, translateService: TranslateService) {
    this.cardService = cardService;
    this.pokerService = pokerService;
    this.sessionService = sessionService;
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

  public changeCardSet(): void {
    this.cardService.changeCardSet();
  }
  //#endregion
}
