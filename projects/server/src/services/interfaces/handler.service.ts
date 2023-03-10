import { AClientMessage } from "../../../../shared-lib/src";
import { LooseObject, IServerParticipant } from "../../objects";
import { IWebSocket } from "../websocket";

/**
 * The handler service is the central service of the system.
 * Every possible event passes through this service.
 */
export interface IHandlerService {
  /**
   * Handle the close event of a socket.
   * If the participant was not 'paused' or 'left' he will be set to 'disconnected' and fellow
   * team members will be notified
   * @param ws - the socket that has been closed
   */

  handleClose(ws: IWebSocket): void;
  /**
   * Handle the open event of a new socket.
   * Creates and stores a participant
   * @param ws - the socket that was opened
   */
  handleConnect(ws: IWebSocket): IServerParticipant;

  /**
   * Callback for the cron service. Currently only cleans up teams that haven't been
   * modified for maxIdleTime
   * @param maxIdleTime - the maximum idle time of a team in milliseconds
   */
  handleCronTick(maxIdleTime: number): void;

  /**
   * Logs the given error and sends an error message to the socket
   * @param ws - the socket to send the error to
   * @param err - the error
   */
  handleError(ws: IWebSocket, err: Error): void;

  /**
   * Handles incoming messages
   * @param message - a message received from the client
   * @param team - the team name, extracted from the URL
   * @param ws - the websocket that received the message
   */
  handleMessage(message: AClientMessage, team: string, ws: IWebSocket): void;

  /**
   * Sends a ping message to every connected participant
   */
  handlePing(): void;

  /**
   * cleans up the storage and sends a server reset message to every connected participant
   */
  handleReset(): LooseObject;
}