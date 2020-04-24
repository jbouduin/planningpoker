import { Injectable } from '@angular/core';
import { Observable, Observer, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  // <editor-fold desc='private properties'>
  private subject?: Subject<MessageEvent>;
  private webSocket?: WebSocket;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  constructor() { }
  // </editor-fold>

  // <editor-fold desc='Public methods'>
	public connect(url: string): Subject<MessageEvent> {
		if (!this.subject || this.webSocket?.readyState !== WebSocket.OPEN) {
			this.subject = this.create(url);
      console.log(`Successfully connected to ${url}`);
		}
		return this.subject;
	}

  public disconnect(): void {
    this.subject = undefined;
    if (this.webSocket) {
      this.webSocket.close();
    }
  }
  // </editor-fold>

  // <editor-fold desc='Private methods'>
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
  // </editor-fold>
}
