import { ICardSetMessage, IServerResetMessage, ITeamIdleMessage } from 'shared-lib';

export type GameMessage = ICardSetMessage | ITeamIdleMessage | IServerResetMessage;
