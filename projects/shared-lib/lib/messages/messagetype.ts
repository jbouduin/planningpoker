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
  Reset,
  // the message types from client to server
  Create,
  Estimate,
  Join,
  // only to be used in development - it will close the socket
  KillMe,
  Leave,
  Nick,
  Reveal,
  Switch,
  Start
}
