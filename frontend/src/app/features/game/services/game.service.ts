import { inject, Service, signal, WritableSignal } from '@angular/core';
import { filter } from 'rxjs';
import { AServerMessage, EServerMessageType, ICardSet, ICardSetMessage } from 'shared-lib';
import { SocketService } from '../../../core';
import { GameMessage, isGameMessage } from '../../../core/messaging';

@Service()
export class GameService {
  //#region private readonly properties ---------------------------------------
  private readonly socketSvc: SocketService;
  //#endregion

  //#region Signals -----------------------------------------------------------
  public cardSet: WritableSignal<ICardSet | null>;
  //#endregion

  //#region Constructor & C° -------------------------------------------------
  public constructor() {
    this.socketSvc = inject(SocketService);
    this.cardSet = signal<ICardSet | null>(null);
    this.socketSvc.incomingMessage
      .pipe(filter((msg: AServerMessage) => isGameMessage(msg)))
      .subscribe((msg: GameMessage) => this.handleServerMessage(msg));
  }
  //#endregion

  //#region Auxiliary methods: message handling -------------------------------
  private handleServerMessage(message: GameMessage): void {
    switch (message.type) {
      case EServerMessageType.CardList:
        this.cardSet.set((<ICardSetMessage>message).data);
        break;
      case EServerMessageType.EndSession:
        this.resetService();
        break;
      case EServerMessageType.ServerReset:
        this.resetService();
    }
  }

  private resetService(): void {
    this.cardSet.set(null);
  }
}
