import { injectable } from "inversify";

import { AServerMessage } from "../../../../shared-lib/lib";
import { Participant } from "../../objects";
import { ISenderService } from "../interfaces";
import { IWebSocket, ReadyState } from "../websocket";

@injectable()
export class SenderService implements ISenderService{

  public sendToParticipant(to: Participant, message: AServerMessage): void {
    console.log(`${new Date().toISOString()}: => to '${to.nick}': ${message.type} - ${JSON.stringify(message)}`);
    this.send(to.socket, message);
  }

  public sendToSocket(socket: IWebSocket, message: AServerMessage): void {
    console.log(`${new Date().toISOString()}: => to socket: ${message.type} - ${JSON.stringify(message)}`);
    this.send(socket, message);
  }

  private send(socket: IWebSocket, message: AServerMessage): void {
    if (socket.readyState === ReadyState.OPEN) {
      try {
        socket.send(JSON.stringify(message));
      } catch (err: unknown) {
        console.log(`${new Date().toISOString()}: => error sending: ${err}`); // eslint-disable-line
      }
    } else {
      console.log(`Can not send, Readystate is ${ReadyState[socket.readyState]} ${socket.readyState}`);
    }
  }
}