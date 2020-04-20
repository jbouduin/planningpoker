import { Injectable } from '@angular/core';
import { Observable, Observer, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  private subject?: Subject<MessageEvent>;
  private webSocket?: WebSocket;

  constructor() { }

	public connect(url: string): Subject<MessageEvent> {
		if (!this.subject) {
			this.subject = this.create(url);
      console.log(`Successfully connected to ${url}`);
		}
		return this.subject;
	}

  public disconnect(): void {
    // TODO: find out how to close
    this.subject = undefined;
    if (this.webSocket) {
      this.webSocket.close();
    }
  }

  private create(url: string): Subject<MessageEvent> {
		const ws = new WebSocket(url);
		const observable = Observable.create(
			(obs: Observer<MessageEvent>) => {
				ws.onmessage = obs.next.bind(obs);
				ws.onerror = obs.error.bind(obs);
				ws.onclose = obs.complete.bind(obs);
				return ws.close.bind(ws);
		});

		const observer = {
			next: (data: Object) => {
				if (ws.readyState === WebSocket.OPEN) {
					ws.send(JSON.stringify(data));
				}
			}
		}

    this.webSocket = ws;
		return Subject.create(observer, observable);
	}
}
