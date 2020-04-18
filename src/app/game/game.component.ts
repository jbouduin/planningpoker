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
    return this.gameService?.game?.team || 'Not connected';
  }

  public get scrumMaster(): string {
    console.log(this.gameService?.self?.role);
    if (this.gameService?.self?.role === Role.ScrumMaster) {
      return this.gameService.self.nick + ' (me)';
    }

    return this.gameService.participants.values().filter(participant => participant.role === Role.ScrumMaster)[0].nick;
    //return 'not connected'
  }

  public get participants(): Array<string> {
    if (this.gameService?.self) {
      return this.gameService.participants.values().map(participant => `${participant.nick}${participant.uuid === this.gameService.self?.uuid || '' ? ' (me)' : ''} `)
    }
    return new Array<string>();
  }

  public get availableCards(): Array<string> {
    if (this.gameService?.game) {
      return this.gameService.game.cards.map(card => card.label);
    }
    return new Array<string>();
  }
}
