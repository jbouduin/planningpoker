import { Component } from '@angular/core';
import { MatDialog, } from '@angular/material/dialog';

import { TranslateService } from '@ngx-translate/core';

import { GameStatus } from '@shared-lib';

import { ConfirmationDialogComponent, ConfirmationDialogParams } from '@shared';
import { SnackbarService } from '@shared';

import { environment } from '@env/environment';

import { Card, IGame, Estimation, Participant } from '../../objects';
import { GameService } from '../../game.service';

@Component({
  selector: 'game-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent  {

  //#region  Private Properties
  private game: IGame;
  //#endregion

  //#region  Public Getter methods
  public get availableCards(): Array<Card> {
    return this.game.availableCards;
  }

  public get canEstimate(): boolean {
    return this.game.canEstimate;
  }

  public get developers(): Array<Participant> {
    return this.game.developers;
  }

  public get developersHeaderLabel(): string {
    return this.translateService.instant('Game.Component.Header.Developers');
  }

  public get enabled(): boolean {
    return this.game.enabled;
  }

  public get myEstimation(): Estimation | undefined {
    return this.game.estimations.find(estimation => estimation.participant.me);
  }

  public get estimations(): Array<Estimation> {
    return this.game.estimations.filter(estimation => !estimation.participant.me);
  }

  public get leaveLabel(): string {
    return this.game.scrumMaster && this.game.scrumMaster.me ?
      this.translateService.instant('Game.Component.ButtonLabel.End_game') :
      this.translateService.instant('Game.Component.ButtonLabel.Leave_game');
  }

  public get observers(): Array<Participant> {
    return this.game.observers;
  }

  public get observersHeaderLabel(): string {
    return this.translateService.instant('Game.Component.Header.Observers');
  }

  public get revealButtonLabel(): string {
    return this.translateService.instant('Game.Component.ButtonLabel.Reveal');
  }

  public get scrumMaster(): Participant | undefined {
    return this.game.scrumMaster;
  }

  public get scrumMasterHeaderLabel(): string {
    return this.translateService.instant('Game.Component.Header.ScrumMaster');
  }

  public get showDisconnect(): boolean {
    return !environment.production && this.game.status !== GameStatus.Disconnected;
  }

  public get showReveal(): boolean {
    return this.game.showReveal;
  }

  public get showStart(): boolean {
    return this.game.showStart;
  }

  public get startButtonLabel(): string {
    return this.translateService.instant('Game.Component.ButtonLabel.Start');
  }

  public get status(): string {
    return GameStatus[this.game.status];
  }

  public get team(): string {
    return this.game.team;
  }
  //#endregion

  //#region  Constructor & C°
  public constructor(
    private dialog: MatDialog,
    private translateService: TranslateService,
    private snackbarService: SnackbarService,
    private gameService: GameService) {
    this.game = gameService.game;
  }
  //#endregion

  //#region  Public Angular interface methods

  //#endregion

  //#region  Public UI Trigger methods
  public disconnect(): void {
    this.gameService.disconnect();
  }

  public leave(): void {
    if (this.game.scrumMaster && this.game.scrumMaster.me) {
      const params = new ConfirmationDialogParams();
      params.cancelButtonLabel = this.translateService.instant('Dialog.ButtonLabel.No');
      params.okButtonLabel = this.translateService.instant('Dialog.ButtonLabel.Yes');
      params.text = this.translateService.instant('Dialog.Confirm.Text.End_the_game');
      params.title = this.translateService.instant('Dialog.Confirm.Title.End_the_game');

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
  //#endregion

}
