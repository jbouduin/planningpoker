export enum ESessionEndedReason {
  /**
   * The scrum master has disbanded the team
   */
  Disbanded = 'disbanded',
  /**
   * The team has been inactive for too long
   */
  IdleTimeOut = 'idle-time-out',
  /**
   * The server has been reset
   */
  ServerReset = 'server-reset',
  /**
   * Self-inflicted end of session: used when user stops the automatic reconnecting
   */
  SelfInflicted = 'self-inflicted'
}
