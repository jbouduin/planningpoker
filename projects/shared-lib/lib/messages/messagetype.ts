export enum MessageType {
  // the message types from server to client
  Cards,
  ClearEstimations,
  EndOfGame,
  Error,
  Estimation,
  Game,
  Participant,
  Ping,
  Self,
  State,
  // the message types from client to server
  Create,
  Estimate,
  Join,
  // only to be used in development
  KillMe,
  Leave,
  Nick,
  Reveal,
  Switch,
  Start
}
