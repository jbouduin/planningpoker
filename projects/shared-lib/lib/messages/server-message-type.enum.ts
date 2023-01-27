export enum EServerMessageType {
  CardList = 'card-list',
  ClearEstimations = 'clear-estimations',
  EndSession = 'end-session',
  Error = 'error',
  EstimationList = 'estimation-list',
  Init = 'init',
  // TODO get rid of gamestatus
  GameStatus = 'game-status',
  MemberChanged = 'member-changed',
  MemberList = 'list',
  Ping = 'ping',
  PokerStatus = 'poker-status',
  Self = 'self',
  TeamName = 'team-name',
  Reset = 'reset'
}