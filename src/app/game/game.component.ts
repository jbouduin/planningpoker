import { Component, OnInit } from '@angular/core';

import { Role } from '../../../projects/shared-lib/lib';
import { GameService } from '../@core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  constructor(private gameService: GameService) { }

  ngOnInit(): void {
  }

  public get team(): string {
    return this.gameService.game?.team || 'Not connected';
  }

  public get scrumMaster(): string {
    const scrumMaster = this.gameService.scrumMaster();
    if (scrumMaster) {
      return `${scrumMaster.nick}${scrumMaster.me ? ' (me)' : ''}`;
    }
    return '';
  }

  public get developers(): Array<string> {
    return this.gameService.developers()
      .map(participant => `${participant.nick}${participant.me ? ' (me)' : ''} `);
  }

  public get availableCards(): Array<string> {
    if (this.gameService?.game) {
      return this.gameService.game.cards.map(card => card.label);
    }
    return new Array<string>();
  }
}
