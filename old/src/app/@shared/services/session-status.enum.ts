export enum ESessionStatus {
  /**
   * The session is active
   * The socket is connected
   */
  Active = 'active',
  /**
   * The user is in the process of creating a session or joining one
   * The socket will try to connect
   */
  Connecting = 'connecting',
  /**
   * The socket has established a connection to the server
   * The session is waiting for the 'init' message
   */
  Initiating = 'initiating',
  /**
   * The user is taking a break
   * The socket is closed
  */
  Suspended = 'suspended',
  /**
   * The leave message has been sent to the server, but has not been aknowledged
   * The socket is open
   */
  Stopping = 'stopping',
  /**
   * The socket has been disconnected
   * The session is counting down to automatically re-establish a connection
   */
  ReconnectPending = 'reconnect-pending',
  /**
   * The session is trying to to automatically re-establish a connection
   */
  Reconnecting = 'reconnecting',
  /**
   * The user is in the process of resuming a session
   * The socket will try to connect
   */
  Resuming = 'resuming',
  /**
   * There is no active session
   * The socket is closed
   */
  Inactive = 'inactive'
}