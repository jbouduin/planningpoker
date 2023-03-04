export enum EErrorCode {
  NoError = 0,
  TeamAlreadyExists = 100,
  TeamDoesNotExist = 101,
  TeamNameMayNotBeEmtpy = 102,
  ParticipantNotFound = 200,
  ParticipantNotInTeam = 201,
  ParticipantAllReadyInTeam = 202,
  ParticipantNameMayNotBeEmpty = 203,
  ParticipantHasNoRole = 300,
  ScrumMasterRequired = 301,
  ObserverCanNotEstimate = 302,
  UnknownEstimationCardMissing = 400,
  MoreThanTwoEstimationCardsRequired = 401,
  ServerError = 500,
  NotImplemented = 501,
  UnknownVerb = 502
}
