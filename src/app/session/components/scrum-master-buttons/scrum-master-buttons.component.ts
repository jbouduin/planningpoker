import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { CardService } from '@app/session/services/card.service';
import { PokerService } from '@app/session/services/poker.service';
import { TeamService } from '@app/session/services/team.service';

import { ERole } from '@shared-lib';

@Component({
  selector: 'session-scrum-master-buttons',
  templateUrl: './scrum-master-buttons.component.html',
  styleUrls: ['./scrum-master-buttons.component.scss']
})
export class ScrumMasterButtonsComponent {

  //#region Private Properties ------------------------------------------------
  private readonly cardService: CardService
  private readonly pokerService: PokerService;
  private readonly teamService: TeamService;
  private readonly translateService: TranslateService;
  //#endregion

  //#region getters -----------------------------------------------------------
  public get changeCardSetButtonLabel(): string {
    return this.translateService.instant('Game.Component.ButtonLabel.Change-card-set');
  }

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

  public get showMe(): boolean {
    return this.teamService.me.role === ERole.ScrumMaster;
  }

  public get showReveal(): boolean {
    return this.pokerService.canPoker;
  }

  public get showStart(): boolean {
    return !this.pokerService.canPoker;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(cardService: CardService, pokerService: PokerService, teamService: TeamService, translateService: TranslateService) {
    this.cardService = cardService;
    this.pokerService = pokerService;
    this.teamService = teamService;
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
