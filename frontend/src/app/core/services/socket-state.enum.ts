export enum ESocketState {
  /**
   * Socket is disconnecting
   */
  Disconnecting = 'disconnecting',
  /**
   * Socket is disconnected
   */
  Disconnected = 'disconnected',
  /**
   * Socket is connecting
   */
  Connecting = 'connecting',
  /**
   * Socket is connected
   */
  Connected = 'connected',
  /**
   * The socket service is trying to automatically re-establish a connection after a previous disconnection
   */
  Reconnecting = 'reconnecting',
  /**
   * The socket has been previously disconnected
   * The socket service is counting down to automatically re-establish a connection
   */
  ReconnectPending = 'reconnect-pending'
}
