export enum EParticipantState {
  Unknown = 'unknown',
  // TODO: implement a waiting room so scrum master can refuse participants
  // this could eventually be a new field on IParticipant
  Connected = 'connected',
  Disconnected = 'disconnected',
  Paused = 'paused',
  Left = 'left'
}
