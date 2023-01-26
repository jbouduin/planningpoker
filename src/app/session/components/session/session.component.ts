import { Component } from '@angular/core';
import { MatDialog, } from '@angular/material/dialog';

import { TranslateService } from '@ngx-translate/core';
import { EGameStatus } from '@shared-lib';
import { ConfirmationDialogComponent, ConfirmationDialogParams } from '@shared';
import { Card, IGame, Estimation, Member, Team, PokerRound } from '../../objects';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'session-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss']
})
export class SessionComponent {

  //#region Private Properties ------------------------------------------------
  private dialog: MatDialog;
  private translateService: TranslateService;
  private sessionService: SessionService;
  //#endregion

  public game: IGame;
  //#region Public Getter methods ---------------------------------------------
  public get availableCards(): Array<Card> {
    return this.game.availableCards;
  }

  public get canEstimate(): boolean {
    return this.game.canEstimate;
  }

  public get enabled(): boolean {
    return this.game.enabled;
  }

  public get team(): Team {
    // TODO this is not what we want
    const result = new Team(this.game.team, this.game.scrumMaster);
    result.developers = this.game.developers;
    result.observers = this.game.observers;
    return result;
  }

  public get pokerRound(): PokerRound {
    // TODO this is not what we want
    const result = new PokerRound();
    result.estimations = this.estimations;
    result.participantsWithoutEstimation = this.participantsWithoutEstimation;
    return result;
  }

  public get estimations(): Array<Estimation> {
    let result: Array<Estimation>;
    let myEstimation: Estimation | undefined;
    switch (this.game.status) {
      case EGameStatus.Revealed:
        result = new Array<Estimation>(...this.game.estimations);
        result.sort((a: Estimation, b: Estimation) => a.card.index - b.card.index);
        break;
      case EGameStatus.Estimating:
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
    if (this.game.status === EGameStatus.Estimating) {
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

  public get status(): string {
    return EGameStatus[this.game.status];
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    dialog: MatDialog,
    translateService: TranslateService,
    gameService: SessionService) {
    this.game = gameService.game;
    this.dialog = dialog;
    this.translateService = translateService;
    this.sessionService = gameService;
  }
  //#endregion

  //#region Public UI Trigger methods -----------------------------------------
  public disconnect(): void {
    this.sessionService.disconnect();
  }

  public leave(): void {
    if (this.game.scrumMaster && this.game.scrumMaster.me) {
      const params = new ConfirmationDialogParams();
      params.cancelButtonLabel = this.translateService.instant('Dialog.ButtonLabel.No');
      params.okButtonLabel = this.translateService.instant('Dialog.ButtonLabel.Yes');
      params.text = this.translateService.instant('Dialog.Confirm.Text.End_Session');
      params.title = this.translateService.instant('Dialog.Confirm.Title.End_session');

      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: '250px',
        data: params
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.sessionService.leave();
        }
      });
    } else {
      this.sessionService.leave();
    }
  }

  public estimate(cardIndex: number): void {
    this.sessionService.estimate(cardIndex);
  }

  public reveal(): void {
    this.sessionService.reveal();
  }

  public start(): void {
    this.sessionService.start();
  }

  public withdraw(): void {
    this.sessionService.withdraw();
  }
  //#endregion

}
