import { Injectable } from '@angular/core';
import { EServerMessageType, ICard, ICardSetMessage, ServerMessage } from '@shared-lib';
import { Card } from '../objects';

@Injectable({
  providedIn: 'root'
})
export class CardService {

  //#region private properties ------------------------------------------------
  private _cards: Array<Card>;
  //#endregion

  //#region getters -----------------------------------------------------------
  public get cards() {
    return this._cards;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  constructor() {
    this._cards = new Array<Card>();
  }
  //#endregion

  //#region public methods ----------------------------------------------------
  public getCard(index: number): Card | undefined {
    return this._cards.find((card: Card) => card.index === index);
  }

  public handleServerMessage(message: ServerMessage): void {
    switch (message.type) {
      case EServerMessageType.CardList:
        this._cards = (<ICardSetMessage>message).data.cards.map((card: ICard) => new Card(card));
        break;
      case EServerMessageType.EndSession:
      case EServerMessageType.ServerReset:
      case EServerMessageType.TeamIdle:
        this._cards = new Array<Card>();
    }
  }
  //#endregion
}
