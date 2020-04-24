import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { GameStatus, ParticipantStatus, Role } from '../../../projects/shared-lib/lib';
import { Card, Game, Estimation, GameService } from '../@core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  // <editor-fold desc='Constructor & C°'>
  public constructor(private gameService: GameService) { }
  // </editor-fold>

  // <editor-fold desc='Public Getter methods'>
  public get availableCards(): Array<Card> {
    return this.gameService.game.availableCards;
  }

  public get developers(): Array<string> {
    return this.gameService.game.developers
      .map(participant => `${ParticipantStatus[participant.status]}: ${participant.nick}${participant.me ? ' (me)' : ''} `);
  }

  public get enabled(): boolean {
    return this.gameService.game.enabled;
  }

  public get estimations(): Array<Estimation> {
    return this.gameService.game.estimations;
  }

  public get scrumMaster(): string {
    const scrumMaster = this.gameService.game.scrumMaster;
    if (scrumMaster) {
      return `${ParticipantStatus[scrumMaster.status]}: ${scrumMaster.nick}${scrumMaster.me ? ' (me)' : ''}`;
    }
    return '';
  }

  public get showEstimate(): boolean {
    return this.gameService.game.showEstimate;
  }

  public get showReveal(): boolean {
    return this.gameService.game.showReveal;
  }

  public get showStart(): boolean {
    return this.gameService.game.showStart;
  }

  public get status(): string {
    return GameStatus[this.gameService.game.status];
  }

  public get team(): string {
    return this.gameService.game.team;
  }
  // </editor-fold>

  // <editor-fold desc='Public Angular interface methods'>
  public ngOnInit(): void {
  }
  // </editor-fold>

  // <editor-fold desc='Public UI Trigger methods'>
  public leave(): void {
    this.gameService.leave();
  }

  public estimate(cardIndex: number): void {
    this.gameService.estimate(cardIndex);
  }

  public reveal(): void {
    this.gameService.reveal();
  }

  public start(): void {
    this.gameService.start();
  }

  public withdraw(): void {
    this.gameService.withdraw();
  }
  // </editor-fold>

}
