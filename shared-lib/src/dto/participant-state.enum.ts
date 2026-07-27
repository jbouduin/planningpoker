export enum EParticipantState {
  Unknown = 'unknown',
  // FEATURE: waiting room -> implement a waiting room so scrum master can refuse participants
  Connected = 'connected',
  Disconnected = 'disconnected',
  Paused = 'paused',
  // FEATURE: kicked out -> a new state for participants that have been kicked out
  Left = 'left'
}
