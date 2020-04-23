export enum MessageType {
  // the message types from server to client
  Cards,
  ClearEstimations,
  Error,
  Estimation,
  Game,
  Participant,
  Ping,
  Self,
  // the message types from client to server
  Create,
  Estimate,
  Join,
  Leave,
  Nick,
  Reveal,
  Switch,
  Start
}
