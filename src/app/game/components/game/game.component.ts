import { Component } from '@angular/core';
import { MatDialog, } from '@angular/material/dialog';

import { TranslateService } from '@ngx-translate/core';
import { EGameStatus } from '@shared-lib';
import { ConfirmationDialogComponent, ConfirmationDialogParams } from '@shared';
import { environment } from '@env/environment';
import { Card, IGame, Estimation, Member } from '../../objects';
import { GameService } from '../../game.service';

@Component({
  selector: 'game-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent {

  //#region Private Properties ------------------------------------------------
  private game: IGame;
  private dialog: MatDialog;
  private translateService: TranslateService;
  private gameService: GameService;
  //#endregion

  //#region Public Getter methods ---------------------------------------------
  public get availableCards(): Array<Card> {
    return this.game.availableCards;
  }

  public get canEstimate(): boolean {
    return this.game.canEstimate;
  }

  public get developers(): Array<Member> {
    return this.game.developers;
  }

  public get developersHeaderLabel(): string {
    return this.translateService.instant('Game.Component.Header.Developers');
  }

  public get enabled(): boolean {
    return this.game.enabled;
  }

  public get estimations(): Array<Estimation> {
    let result: Array<Estimation>;
    let myEstimation: Estimation | undefined;
    switch (this.game.status) {
      case EGameStatus.Revealed:
        result = new Array<Estimation>(...this.game.estimations);
        result.sort((a: Estimation, b: Estimation) => a.card.index - b.card.index);
        break;
      case EGameStatus.Started:
        result = this.game.estimations.filter((e: Estimation) => !e.member.me);
        result.sort((a: Estimation, b: Estimation) => a.member.nick.localeCompare(b.member.nick));
        myEstimation = this.game.estimations.find(estimation => estimation.member.me);
        if (myEstimation) {
          result.splice(0, 0, myEstimation);
        }
        break;
      default:
        result = new Array<Estimation>();
    }
    return result;
  }

  public get participantsWithoutEstimation(): Array<Member> {
    let result: Array<Member>;
    if (this.game.status === EGameStatus.Started) {
      if (this.game.scrumMaster) {
        if (this.game.scrumMaster.observer) {
          result = this.game.developers;
        }
        else {
          result = this.game.developers.concat([this.game.scrumMaster]);
        }
      }
      else {
        result = this.game.developers;
      }
    }
    else {
      result = new Array<Member>();
    }
    return result
      .filter((p: Member) => this.game.estimations.findIndex((e: Estimation) => e.member.uuid == p.uuid) < 0)
      .sort((a: Member, b: Member) => a.nick.localeCompare(b.nick));
  }

  public get leaveLabel(): string {
    return this.game.scrumMaster && this.game.scrumMaster.me ?
      this.translateService.instant('Game.Component.ButtonLabel.End_game') :
      this.translateService.instant('Game.Component.ButtonLabel.Leave_game');
  }

  public get meLabel(): string {
    return this.translateService.instant('Game.Card.Me_label');
  }

  public get observers(): Array<Member> {
    return this.game.observers;
  }

  public get observersHeaderLabel(): string {
    return this.translateService.instant('Game.Component.Header.Observers');
  }

  public get revealButtonLabel(): string {
    return this.translateService.instant('Game.Component.ButtonLabel.Reveal');
  }

  public get scrumMaster(): Member | undefined {
    return this.game.scrumMaster;
  }

  public get scrumMasterHeaderLabel(): string {
    return this.translateService.instant('Game.Component.Header.ScrumMaster');
  }

  public get showDisconnect(): boolean {
    return !environment.production && this.game.status !== EGameStatus.Disconnected;
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
    return EGameStatus[this.game.status];
  }

  public get team(): string {
    return this.game.team;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    dialog: MatDialog,
    translateService: TranslateService,
    gameService: GameService) {
    this.game = gameService.game;
    this.dialog = dialog;
    this.translateService = translateService;
    this.gameService = gameService;
  }
  //#endregion

  //#region Public UI Trigger methods -----------------------------------------
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
