import { injectable } from 'inversify';
import 'reflect-metadata';

import { EParticipantStatus, ERole } from '../../../shared-lib/lib';

import { Team, ITeam } from '../objects/team';
import { Participant } from '../objects/participant';
import { IWebSocket } from './websocket';

export interface IFactoryService {
  dummyGame(unknownEstimationIndex: number): ITeam;
  dummyParticipant(socket: IWebSocket): Participant;
  newTeam(team: string, unknownEstimationIndex: number): ITeam
  newParticipant(nick: string, uuid: string, role: ERole, socket: IWebSocket): Participant;
}

@injectable()
export class FactoryService implements IFactoryService {
  //#region Interface IFactoryService methods ---------------------------------
  public dummyGame(unknownEstimationIndex: number): ITeam {
    return new Team('dummy', unknownEstimationIndex);
  }

  public dummyParticipant(socket: IWebSocket): Participant {
    const result = new Participant('dummy', '', ERole.Unknown, socket);
    result.status = EParticipantStatus.Disconnected;
    return result;
  }

  public newTeam(team: string, unknownEstimationIndex: number): ITeam {
    return new Team(team, unknownEstimationIndex);
  }

  public newParticipant(nick: string, uuid: string, role: ERole, socket: IWebSocket) {

    return new Participant(nick, uuid, role, socket);
  }

  //#endregion
}
