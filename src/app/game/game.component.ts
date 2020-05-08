import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';

import { GameStatus, ParticipantStatus, Role } from '@shared-lib';
import { Card, Game, Estimation, GameService } from '../@core';

import { environment } from '../../environments/environment';

import { ConfirmationDialogComponent, ConfirmationDialogParams } from '@shared';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  // <editor-fold desc='Private Properties'>
  private game: Game;
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

  public get leaveLabel(): string {
    return this.game.scrumMaster && this.game.scrumMaster.me ? 'End game' : 'Leave';
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

  // <editor-fold desc='Constructor & C°'>
  public constructor(
    private dialog: MatDialog,
    private gameService: GameService) {
    this.game = gameService.game;
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
    if (this.game.scrumMaster && this.game.scrumMaster.me) {
      const params = new ConfirmationDialogParams();
      params.cancelButtonLabel = 'No';
      params.okButtonLabel = 'Yes';
      params.title = 'End the game';
      params.text = 'Are you sure you want to end the game?';

      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: '250px',
        data: params
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.gameService.leave();
        }
      });
    } else {
      this.gameService.leave();
    }
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
