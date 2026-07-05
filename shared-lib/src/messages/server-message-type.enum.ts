export enum EServerMessageType {
  /**
   * Send the cardset to be used
   */
  CardSet = 'card-set',
  /**
   * Indicates the end of the handshake
   */
  EndHandshake = 'end-handshake',
  /**
   * Sent when an error occurred
   */
  Error = 'error',
  /**
   * Sent when the estimations have been cleared
   */
  EstimationsCleared = 'estimations-cleared',
  /**
   * Send all estimations.
   * This can be
   * - a snapshot: sent after the handshake when a participant joins or rejoins
   * - a single estimation: broadcasted after a participant has given an estimation
   */
  EstimationList = 'estimation-list',
  /**
   * Broadcasted if a participant has withdrawn his estimation
   */
  EstimationWithdrawn = 'estimation-withdrawn',
  /**
   * Sent if the game state changed
   */
  GameStateChanged = 'game-state-changed',
  /**
   * Sent if any property of a participant changed
   */
  ParticipantChanged = 'participant-changed',
  /**
   * The complete participant list.
   * Sent as part of the handshake sequence
   */
  ParticipantList = 'participant-list',
  /**
   * Ping message
   */
  Ping = 'ping',
  /**
   * Sent participant data about _self_.
   */
  Self = 'self',
  /**
   * Indicates the end of the session
   */
  SessionEnded = 'end-session',
  /**
   * Starts the handshake
   */
  StartHandshake = 'init',
  /**
   * Send the team name
   */
  Team = 'team'
}
