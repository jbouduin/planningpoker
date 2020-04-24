export enum ReadyState {
  CONNECTING,
  OPEN,
  CLOSING,
  CLOSED
}

export interface WebSocket {
  readyState: ReadyState;
  close(): void;
  send(message: string): void;
}
