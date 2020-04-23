export enum ErrorCode {
  NoError = 0,
  TeamAlreadyExists = 100,
  TeamDoesNotExist = 101,
  ParticipantNotFound = 200,
  ParticipantNotInTeam = 201,
  ParticipantAllReadyInTeam = 202,
  ScrumMasterRequired = 301,
  DeveloperRequired = 302,
  ServerError = 500,
  NotImplemented = 501,
  UnknownVerb = 502
}
