import { Injectable } from "@angular/core";
import { filter } from "rxjs";
import { AServerMessage } from "shared-lib";
import { SocketService } from "../../../core";
import { isTeamMessage, TeamMessage } from "../../../core/messaging";

@Injectable({ providedIn: 'root' })
export class TeamService {
  //#region private readonly properties ---------------------------------------
  private readonly socketService: SocketService;
  //#endregion

  public constructor(socketService: SocketService) {
    this.socketService = socketService;
    socketService.incomingMessage
      .pipe(
        filter((msg: AServerMessage) => isTeamMessage(msg))
      )
      .subscribe((msg: TeamMessage) => this.handleServerMessage(msg));
  }

  //#region Auxiliary methods -------------------------------------------------
  private handleServerMessage(message: TeamMessage): void {
    console.log("Teamservice incoming message", message.type, message.data);
  }
  //#endregion
  /**
   * should handle:
   * MemberList
   * MemberChanged
   * TeamIdle
   * ServerReset
   */
}
