import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { GameStatus, ParticipantStatus, Role } from '../../../projects/shared-lib/lib';
import { Card, Estimation, GameService } from '../@core';

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
    return this.gameService.cards;
  }

  public get status(): string {
    return GameStatus[this.gameService.status];
  }

  public get canEstimate(): boolean {
    return this.gameService.status === GameStatus.Started;
  }

  public get canReveal(): boolean {

    return this.gameService.status === GameStatus.Started &&
      this.gameService.myRole === Role.ScrumMaster &&
      this.gameService.estimations.length === this.gameService.developers.length + 1;
  }

  public get canStart(): boolean {
    return (this.gameService.status === GameStatus.Revealed || this.gameService.status === GameStatus.Stopped) &&
      this.gameService.myRole === Role.ScrumMaster;
  }

  public get team(): string {
    return this.gameService.team;
  }

  public get developers(): Array<string> {
    return this.gameService.developers
      .map(participant => `${ParticipantStatus[participant.status]}: ${participant.nick}${participant.me ? ' (me)' : ''} `);
  }

  public get estimations(): Array<Estimation> {
    console.log(this.gameService.estimations);
    return this.gameService.estimations;
  }

  public get scrumMaster(): string {
    const scrumMaster = this.gameService.scrumMaster;
    if (scrumMaster) {
      return `${ParticipantStatus[scrumMaster.status]}: ${scrumMaster.nick}${scrumMaster.me ? ' (me)' : ''}`;
    }
    return '';
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
