import { Injectable, signal, WritableSignal } from '@angular/core';
import { SocketService } from '../../../core';
import { AServerMessage, EServerMessageType, ICardSet, ICardSetMessage } from 'shared-lib';
import { filter } from 'rxjs';
import { GameMessage, isGameMessage } from '../../../core/messaging';

@Injectable({ providedIn: 'root' })
export class GameService {
  //#region private readonly properties ---------------------------------------
  private readonly socketService: SocketService;
  //#endregion

  //#region Signals -----------------------------------------------------------
  public cardSet: WritableSignal<ICardSet | null>;
  //#endregion

  public constructor(socketService: SocketService) {
    this.socketService = socketService;
    this.cardSet = signal<ICardSet | null>(null);
    socketService.incomingMessage
      .pipe(filter((msg: AServerMessage) => isGameMessage(msg)))
      .subscribe((msg: GameMessage) => this.handleServerMessage(msg));
  }

  //#region Auxiliary methods -------------------------------------------------
  private handleServerMessage(message: GameMessage): void {
    switch (message.type) {
      case EServerMessageType.CardList:
        this.handleCardListMessage(<ICardSetMessage>message);
        break;
      case EServerMessageType.ClearEstimations:
        break;
      case EServerMessageType.EndSession:
        this.resetService();
        break;
      case EServerMessageType.EstimationList:
        break;
      case EServerMessageType.PokerStatus:
        break;
      case EServerMessageType.ServerReset:
        this.resetService();
    }
  }
  //#endregion

  private handleCardListMessage(message: ICardSetMessage): void {
    this.cardSet.set(message.data);
  }

  private resetService(): void {
    this.cardSet.set(null);
  }
  /**
   * Should handle:
   * CardList
   * EstimationList
   * ClearEstimations
   * PokerStatus
   * TeamIdle
   * ServerReset
   */
}
