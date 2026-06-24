// TODO rename to EPokerState
export enum EPokerStatus {
  // TODO: rename cleared to something different
  Cleared = 'cleared',
  /**
   * When started participants can give estimations
   */
  Started = 'started',
  /**
   * The round is finished and estimations are revealed
   */
  Revealed = 'revealed'
}
