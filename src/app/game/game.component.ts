import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { GameStatus, ParticipantStatus, Role } from '../../../projects/shared-lib/lib';
import { environment } from '../../environments/environment';
import { Card, Game, Estimation, GameService } from '../@core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  // <editor-fold desc='Private Properties'>
  private game: Game;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(private gameService: GameService) {
    this.game = gameService.game;
  }
  // </editor-fold>

  // <editor-fold desc='Public Getter methods'>
  public get availableCards(): Array<Card> {
    return this.game.availableCards;
  }

  public get developers(): Array<string> {
    return this.game.developers
      .map(participant => `${ParticipantStatus[participant.status]}: ${participant.nick}${participant.me ? ' (me)' : ''} `);
  }

  public get enabled(): boolean {
    return this.game.enabled;
  }

  public get estimations(): Array<Estimation> {
    return this.game.estimations;
  }

  public get reconnectIn(): number {
    return this.gameService.reconnectIn;
  }

  public get scrumMaster(): string {
    const scrumMaster = this.game.scrumMaster;
    if (scrumMaster) {
      return `${ParticipantStatus[scrumMaster.status]}: ${scrumMaster.nick}${scrumMaster.me ? ' (me)' : ''}`;
    }
    return '';
  }

  public get showDisconnect(): boolean {
    return !environment.production && this.game.status !== GameStatus.Disconnected;
  }

  public get showEstimate(): boolean {
    return this.game.showEstimate;
  }

  public get showReveal(): boolean {
    return this.game.showReveal;
  }

  public get showStart(): boolean {
    return this.game.showStart;
  }

  public get status(): string {
    return GameStatus[this.game.status];
  }

  public get team(): string {
    return this.game.team;
  }
  // </editor-fold>

  // <editor-fold desc='Public Angular interface methods'>
  public ngOnInit(): void {
  }
  // </editor-fold>

  // <editor-fold desc='Public UI Trigger methods'>
  public disconnect(): void {
    this.gameService.disconnect();
  }

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
