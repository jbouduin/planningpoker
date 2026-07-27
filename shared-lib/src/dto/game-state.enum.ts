export enum EGameState {
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
