import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ClientMessage, EServerMessageType, IInitMessage, ServerMessage } from '@shared-lib';
import { map, Observable, Observer, Subject } from 'rxjs';

import { EConnectionStatus } from './connection-status.enum';
import { SnackbarService } from './snackbar.service';

type AMessage = ServerMessage | ClientMessage;

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {

  //#region private properties ------------------------------------------------
  private readonly snackbarService: SnackbarService;
  private readonly translateService: TranslateService;
  private currentReconnectIn: number;
  private reconnectTimer: number;
  private subject?: Subject<AMessage>;
  private webSocket?: WebSocket;
  //#endregion

  //#region Public properties -------------------------------------------------
  public connectionStatus: EConnectionStatus;
  //#endregion

  //#region Public getter methods ---------------------------------------------
  public get reconnectIn(): number {
    return this.currentReconnectIn;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  constructor(snackbarService: SnackbarService, translateService: TranslateService) {
    this.snackbarService = snackbarService;
    this.translateService = translateService;
    this.connectionStatus = EConnectionStatus.Disconnected;
    this.currentReconnectIn = 0;
    this.reconnectTimer = 0;
  }
  //#endregion

  //#region Public methods ----------------------------------------------------
  public connect(
    teamName: string,
    initialMessage: ClientMessage,
    messageHandler: (msg: ServerMessage) => void): Subject<AMessage> {
    // TODO find a way to pass the first part of the url to connection service (probably ask portnumber from host)
    const url = `ws://localhost:3001/game/${encodeURI(teamName)}`
    if (!this.subject || this.webSocket?.readyState !== WebSocket.OPEN) {
      this.subject = this.create(url).pipe(map((response: MessageEvent): AMessage => {
        console.log(response.data);
        const message: AMessage = JSON.parse(response.data);
        return message;
      })) as Subject<AMessage>;
      this.subject.subscribe({
        next: (msg: AMessage) => {
          if (msg.type == EServerMessageType.Init) {
            initialMessage.senderUuid = (<IInitMessage>msg).data.uuid;
            this.sendMessage(initialMessage);
          }
          messageHandler(msg as ServerMessage);
        },
        error: (error) => {
          // we pass here if the connection drops or if the socket connection fails
          console.log('in error handle');
          console.log(error);
          if (error.target && error.target.readyState && error.target.readyState === 3) {
            this.handleDisconnect();
            // TODO this.initiateReconnectTimer();
          } else {
            this.handleSocketError(error);
          }
        },
        complete: () => {
          // this happens when the client or the server close the socket
          // normally that happens only after 'leave'
          // so we normally do not have to do anything here
          console.log('gracefull disconnect');
        }
      });
      this.connectionStatus = EConnectionStatus.Connected;
      console.log(`Successfully connected to ${url}`);
    }

    return this.subject;
  }

  public disconnect(): void {
    if (this.subject) {
      this.subject.unsubscribe();
    }
    this.subject = undefined;
    if (this.webSocket) {
      this.webSocket.close();
    }
    this.connectionStatus = EConnectionStatus.Disconnected;
  }

  public sendMessage(message: ClientMessage): void {
    if (this.subject) {
      this.subject.next(message);
    }
  }
  //#endregion

  //#region Private methods ---------------------------------------------------
  private initiateReconnectTimer(callback: () => void): void {
    this.currentReconnectIn = 30;
    this.connectionStatus = EConnectionStatus.Countdown;
    this.reconnectTimer = window.setInterval(this.reconnectTick.bind(this), 1000, callback);
  }

  private create(url: string): Subject<MessageEvent> {
    const ws = new WebSocket(url);
    const observable = new Observable(
      (obs: Observer<MessageEvent>) => {
        ws.onmessage = obs.next.bind(obs);
        ws.onerror = obs.error.bind(obs);
        ws.onclose = obs.complete.bind(obs);
        return ws.close.bind(ws);
      });

    const observer = {
      next: (data: object) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data));
        }
      }
    }

    this.webSocket = ws;
    // TODO: (#695) lint says to use new Subject
    return Subject.create(observer, observable);
  }

  private reconnectTick(callback: () => void) {
    this.currentReconnectIn--;
    if (this.currentReconnectIn === 0) {
      window.clearInterval(this.reconnectTimer);
      callback();
    }
  }

  private handleDisconnect(): void {
    this.snackbarService.showError(
      this.translateService.instant('Game.Snackbar.Disconnected')
    );
  }

  private handleSocketError(_error: unknown): void {
    this.snackbarService.showError(
      this.translateService.instant('Game.Snackbar.CommunicationError')
    );
  }
  //#endregion
}
