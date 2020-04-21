import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { DtoCard } from '../../../projects/shared-lib/lib';
import { GameService } from '../@core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements AfterViewInit, OnInit {

  // constructor
  public constructor(private ar: ActivatedRoute, private gameService: GameService) { }

  // getters
  public get team(): string {
    return this.gameService.team;
  }

  public get scrumMaster(): string {
    const scrumMaster = this.gameService.scrumMaster;
    if (scrumMaster) {
      return `${scrumMaster.nick}${scrumMaster.me ? ' (me)' : ''}`;
    }
    return '';
  }

  public get developers(): Array<string> {
    return this.gameService.developers
      .map(participant => `${participant.nick}${participant.me ? ' (me)' : ''} `);
  }

  public get availableCards(): Array<DtoCard> {
    return this.gameService.cards; //.map(card => card.label);
  }

  // interface members
  public ngAfterViewInit(): void {
    // TODO: remove this afterwards
    console.log(this.ar);
  }

  public ngOnInit(): void {
  }

  // public methods
  public leave(): void {
    this.gameService.leave();
  }

  public estimate(cardIndex: number) {

  }
}
