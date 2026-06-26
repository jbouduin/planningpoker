import { IParticipantChangedMessage, IParticipantListMessage, IServerResetMessage, ITeamIdleMessage } from 'shared-lib';

export type TeamMessage = IParticipantChangedMessage | IParticipantListMessage | ITeamIdleMessage | IServerResetMessage;
