// leave this file in place! It contains keys for translations that can not be extracted
// TODO 2343 marker does not work anymore
export function marker<T extends string | string[]>(key: T): T {
  return key;
}

marker('ErrorCode.TeamAlreadyExists');
marker('ErrorCode.TeamDoesNotExist');
marker('ErrorCode.ParticipantNotFound');
marker('ErrorCode.ParticipantNotInTeam');
marker('ErrorCode.ParticipantAllReadyInTeam');
marker('ErrorCode.ScrumMasterRequired');
marker('ErrorCode.DeveloperRequired');
marker('ErrorCode.ServerError');
marker('ErrorCode.NotImplemented');
marker('ErrorCode.UnknownVerb');
