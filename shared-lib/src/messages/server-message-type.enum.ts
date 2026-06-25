export enum EServerMessageType {
  CardSet = 'card-lset',
  ClearEstimations = 'clear-estimations',
  EndInit = 'end-init',
  EndSession = 'end-session',
  Error = 'error',
  EstimationList = 'estimation-list',
  GameStateChanged = 'game-state-changed',
  Init = 'init',
  MemberChanged = 'member-changed',
  MemberList = 'member-list',
  Ping = 'ping',
  Self = 'self',
  ServerReset = 'server-reset',
  TeamIdle = 'team-idle',
  TeamName = 'team-name'
}
