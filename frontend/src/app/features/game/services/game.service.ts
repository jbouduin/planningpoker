import { Injectable } from "@angular/core";
import { SocketService } from "../../../core";
import { AServerMessage, EServerMessageType } from "shared-lib";
import { filter } from "rxjs";
import { GameMessage, isGameMessage } from "../../../core/messaging";

@Injectable({ providedIn: 'root' })
export class GameService {
  //#region private readonly properties ---------------------------------------
  private readonly socketService: SocketService;
  //#endregion

  public constructor(socketService: SocketService) {
    this.socketService = socketService;
    socketService.incomingMessage
      .pipe(
        filter((msg: AServerMessage) => isGameMessage(msg))
      )
      .subscribe((msg: GameMessage) => this.handleServerMessage(msg));
  }

  //#region Auxiliary methods -------------------------------------------------
  private handleServerMessage(message: GameMessage): void {
    console.log("GameService incoming message", message.type, message.data);
  }
  //#endregion

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
