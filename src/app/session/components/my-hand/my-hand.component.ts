import { Component } from '@angular/core';

import { Card } from '@shared/components/card/card';
import { CardService } from '../../services/card.service';
import { PokerService } from '../../services/poker.service';
import { TeamService } from '../../services/team.service';

@Component({
  selector: 'session-my-hand',
  templateUrl: './my-hand.component.html',
  styleUrls: ['./my-hand.component.scss']
})
export class MyHandComponent {

  //#region private properties ------------------------------------------------
  private readonly cardService: CardService;
  private readonly pokerService: PokerService;
  private readonly teamService: TeamService;
  //#endregion

  //#region getters -----------------------------------------------------------
  public get cards(): Array<Card> {
    return this.cardService.cards;
  }

  public get canEstimate(): boolean {
    return this.pokerService.canPoker && this.teamService.canPoker;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(cardService: CardService, pokerService: PokerService, teamService: TeamService) {
    this.cardService = cardService;
    this.teamService = teamService;
    this.pokerService = pokerService;
  }
  //#endregion

  //#region UI triggered methods ----------------------------------------------
  public cardClicked(index: number) {
    this.pokerService.estimate(index);
  }
  //#endregion
}
