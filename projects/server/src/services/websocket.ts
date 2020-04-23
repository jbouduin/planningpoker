export enum ReadyState {
  CONNECTING,
  OPEN,
  CLOSING,
  CLOSED
}

export interface WebSocket {
  readyState: ReadyState;
  send(message: string): void;
}
