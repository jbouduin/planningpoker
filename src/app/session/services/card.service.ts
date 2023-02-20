import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { ECardSet, EServerMessageType, ICard, ICardSet, ICardSetMessage, ServerMessage } from '@shared-lib';

import { Card, ConnectionService } from '@shared';
import { ChangeCardSetMessage } from '../messages';
import { TeamService } from './team.service';
import { ICardSetDialogParams } from '@app/@shared/components/card-set-dialog/card-set-dialog.params';
import { CardSetDialogComponent } from '@app/@shared/components/card-set-dialog/card-set-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class CardService {

  //#region private properties ------------------------------------------------
  private readonly connectionService: ConnectionService;
  private readonly dialog: MatDialog;
  private readonly teamService: TeamService;
  private currentCardSet: ECardSet;
  private _cards: Array<Card>;
  //#endregion

  //#region getters -----------------------------------------------------------
  public get cards() {
    return this._cards;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  constructor(connectionService: ConnectionService, dialog: MatDialog, teamService: TeamService) {
    this.connectionService = connectionService;
    this.dialog = dialog;
    this.teamService = teamService;
    this.currentCardSet = ECardSet.Cohn;
    this._cards = new Array<Card>();
    this.connectionService.incomingMessage.subscribe((serverMessage: ServerMessage) => this.handleServerMessage(serverMessage));
    this.connectionService.reset.subscribe(() => this.resetMe());
  }
  //#endregion

  //#region public methods ----------------------------------------------------
  public getCard(index: number): Card | undefined {
    return this._cards.find((card: Card) => card.index === index);
  }

  public changeCardSet(): void {
    const data: ICardSetDialogParams = {
      cardSets: [ECardSet.Cohn, ECardSet.Fibonacci, ECardSet.TShirt],
      currentCards: this._cards.map((card: Card) => {
        return {
          index: card.index,
          label: card.label,
          isIcon: card.isIcon,
          isUnknownEstimation: card.isUnknownEstimation
        }
      }),
      currentCardSet: this.currentCardSet
    }
    const dialogRef = this.dialog.open(CardSetDialogComponent, { data: data });

    dialogRef.afterClosed().subscribe((result: ICardSet) => {
      if (result) {
        const message = new ChangeCardSetMessage(this.teamService.me.uuid, result);
        this.connectionService.sendMessage(message);
      }
    });
  }

  public handleServerMessage(message: ServerMessage): void {
    switch (message.type) {
      case EServerMessageType.CardList:
        this._cards = (<ICardSetMessage>message).data.cards.map((card: ICard) => new Card(card));
        this.currentCardSet = (<ICardSetMessage>message).data.cardSet;
        break;
      case EServerMessageType.EndSession:
      case EServerMessageType.ServerReset:
      case EServerMessageType.TeamIdle:
        this.resetMe();
    }
  }

  public giveUpReconnecting(): void {
    this._cards = new Array<Card>();
  }
  //#endregion

  private resetMe(): void {
    this._cards = new Array<Card>();
  }
}
