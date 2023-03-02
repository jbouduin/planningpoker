export enum EErrorCode {
  NoError = 0,
  TeamAlreadyExists = 100,
  TeamDoesNotExist = 101,
  ParticipantNotFound = 200,
  ParticipantNotInTeam = 201,
  ParticipantAllReadyInTeam = 202,
  ParticipantHasNoRole = 300,
  ScrumMasterRequired = 301,
  ObserverCanNotEstimate = 302,
  ServerError = 500,
  NotImplemented = 501,
  UnknownVerb = 502
}
