export enum EClientMessageType {
  /**
   * Change the cardset used in the session
   */
  ChangeCardSet = 'change-card-set',
  /**
   * Change the nickname of the participant.
   * Can only be executed for self.
   */
  ChangeNick = 'change-nick',
  /**
   * Assign the scrum master role to another participant.
   */
  ChangeScrumMaster = 'change-scrum-master',
  /**
   * Clear the estimations __without changing the game state
   */
  ClearEstimations = 'clear-estimations',
  /**
   * Create a session.
   */
  Create = 'create',
  /**
   * Give an estimation.
   * Can only be executed for self.
   */
  Estimate = 'estimate',
  /**
   * Join an existing session.
   */
  Join = 'join',
  /**
   * Leave a session.
   * Can only be executed for self.
   * If the scrum master is leaving, this ends the session also.
   */
  Leave = 'leave',
  /**
   * Change the observer flag of a participant.
   */
  Observe = 'observe',
  /**
   * Pause the session.
   * Can only be executed for self.
   */
  Pause = 'pause',
  /**
   * Rejoin a session.
   */
  Rejoin = 'rejoin',
  /**
   * Remove a participant from a session.
   */
  Remove = 'remove',
  /**
   * Reveal the estimations.
   */
  Reveal = 'reveal',
  /**
   * Start estimation round.
   */
  Start = 'start',
  /**
   * Withdraw a previously given estimation.
   * Can only be executed for self.
   */
  WithdrawEstimation = 'withdraw-estimation'
}
