export enum ESessionState {
  /**
   * There is no active session
   */
  Inactive = 'inactive',
  /**
   * The session is handshaking with the server
   */
  Handshaking = 'handshaking',
  /**
   * The session is active
   */
  Active = 'active',
  /**
   * The session is suspended. Participant is disconnected or taking a break
   */
  Suspended = 'suspended',
  /**
   * The session has ended.
   */
  Ended = 'ended'
}
