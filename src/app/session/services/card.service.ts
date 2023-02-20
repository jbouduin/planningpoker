import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { ECardSet, EServerMessageType, ICard, ICardSet, ICardSetMessage, AServerMessage } from '@shared-lib';

import { Card, CardSetDialogComponent, ICardSetDialogParams } from '@shared/components';
import { ChangeCardSetMessage } from '@shared/messages';
import { SessionService } from '@shared/services';

@Injectable({
  providedIn: 'root'
})
export class CardService {

  //#region private properties ------------------------------------------------
  private readonly sessionService: SessionService;
  private readonly dialog: MatDialog;
  private currentCardSet: ECardSet;
  private _cards: Array<Card>;
  //#endregion

  //#region getters -----------------------------------------------------------
  public get cards() {
    return this._cards;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  constructor(dialog: MatDialog, sessionService: SessionService) {
    this.dialog = dialog;
    this.sessionService = sessionService;
    this.currentCardSet = ECardSet.Cohn;
    this._cards = new Array<Card>();
    this.sessionService.incomingMessage.subscribe((serverMessage: AServerMessage) => this.handleServerMessage(serverMessage));
    this.sessionService.reset.subscribe(() => this.resetService());
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
        const message = new ChangeCardSetMessage(this.sessionService.myUuid, result);
        this.sessionService.sendMessage(message);
      }
    });
  }

  public handleServerMessage(message: AServerMessage): void {
    switch (message.type) {
      case EServerMessageType.CardList:
        this._cards = (<ICardSetMessage>message).data.cards.map((card: ICard) => new Card(card));
        this.currentCardSet = (<ICardSetMessage>message).data.cardSet;
        break;
      case EServerMessageType.EndSession:
      case EServerMessageType.ServerReset:
      case EServerMessageType.TeamIdle:
        this.resetService();
    }
  }

  public giveUpReconnecting(): void {
    this._cards = new Array<Card>();
  }
  //#endregion

  private resetService(): void {
    this._cards = new Array<Card>();
  }
}
