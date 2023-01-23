import { injectable } from 'inversify';
import 'reflect-metadata';

import { ParticipantStatus, Role } from '../../../shared-lib/lib';

import { Team, ITeam } from './game/team';
import { Participant } from './game/participant';
import { WebSocket } from './websocket';

export interface IFactoryService {
  dummyGame(): ITeam;
  dummyParticipant(socket: WebSocket): Participant;
  newTeam(team: string): ITeam
  newParticipant(nick: string, uuid: string, role: Role, socket: WebSocket): Participant;
}

@injectable()
export class FactoryService implements IFactoryService {
  //#region Interface IFactoryService methods ---------------------------------
  public dummyGame(): ITeam {
    return new Team('dummy');
  }

  public dummyParticipant(socket: WebSocket): Participant {
    const result = new Participant('dummy', '', Role.Unknown, socket);
    result.status = ParticipantStatus.Disconnected;
    return result;
  }

  public newTeam(team: string): ITeam {
    return new Team(team);
  }

  public newParticipant(nick: string, uuid: string, role: Role, socket: WebSocket) {
    return new Participant(nick, uuid, role, socket);
  }

  //#endregion
}
