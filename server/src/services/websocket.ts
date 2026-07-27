export enum ReadyState {
  CONNECTING,
  OPEN,
  CLOSING,
  CLOSED
}

export interface IWebSocket {
  readyState: ReadyState;
  close(): void;
  send(message: string): void;
}
