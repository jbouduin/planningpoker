import { Injectable } from '@angular/core';
import { Observable, Observer, Subject } from 'rxjs';

import { EConnectionStatus } from './connection-status.enum';

@Injectable({
  providedIn: 'root'
})
export class ConnectionService {

  //#region private properties ------------------------------------------------
  private currentReconnectIn: number;
  private reconnectTimer: number;
  private subject?: Subject<MessageEvent>;
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
  constructor() {
    this.connectionStatus = EConnectionStatus.Disconnected;
    this.currentReconnectIn = 0;
    this.reconnectTimer = 0;
  }
  //#endregion

  //#region Public methods ----------------------------------------------------
	public connect(url: string): Subject<MessageEvent> {
		if (!this.subject || this.webSocket?.readyState !== WebSocket.OPEN) {
			this.subject = this.create(url);
      this.connectionStatus = EConnectionStatus.Connected;
      console.log(`Successfully connected to ${url}`);
		}
		return this.subject;
	}

  public disconnect(): void {
    this.subject = undefined;
    if (this.webSocket) {
      this.webSocket.close();
    }
    this.connectionStatus = EConnectionStatus.Disconnected;
  }

  public handleDisconnect(callback: () => void): void {
    this.currentReconnectIn = 30;
    this.connectionStatus = EConnectionStatus.Countdown;
    this.reconnectTimer = window.setInterval(this.reconnectTick.bind(this), 1000, callback);
  }
  //#endregion

  //#region Private methods ---------------------------------------------------
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
  //#endregion
}
