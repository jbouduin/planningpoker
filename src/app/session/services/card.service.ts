import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { ECardSet, EServerMessageType, ICard, ICardSetMessage, ServerMessage } from '@shared-lib';

import { ConnectionService } from '../../@shared';
import { ChangeCardSetDialogComponent } from '../components/change-card-set-dialog/change-card-set-dialog.component';
import { ChangeCardSetMessage } from '../messages';
import { Card } from '../objects';
import { TeamService } from './team.service';

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
  }
  //#endregion

  //#region public methods ----------------------------------------------------
  public getCard(index: number): Card | undefined {
    return this._cards.find((card: Card) => card.index === index);
  }

  public changeCardSet(): void {
    const data = new Array<ECardSet>();
    if (this.currentCardSet !== ECardSet.Cohn) {
      data.push(ECardSet.Cohn);
    }

    if (this.currentCardSet !== ECardSet.Fibonacci) {
      data.push(ECardSet.Fibonacci);
    }

    if (this.currentCardSet !== ECardSet.TShirt) {
      data.push(ECardSet.TShirt);
    }
    const dialogRef = this.dialog.open(ChangeCardSetDialogComponent, {
      width: '350px',
      data: data
    });

    dialogRef.afterClosed().subscribe((result: ECardSet) => {
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
        this._cards = new Array<Card>();
    }
  }
  //#endregion
}
