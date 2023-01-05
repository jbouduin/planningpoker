import { injectable } from 'inversify';
import 'reflect-metadata';

import { ParticipantStatus, Role } from '../../../shared-lib/lib';

import { Game, IGame } from './game/game';
import { Participant } from './game/participant';
import { WebSocket } from './websocket';

export interface IFactoryService {
  dummyGame(): IGame;
  dummyParticipant(socket: WebSocket): Participant;
  newGame(team: string): IGame
  newParticipant(nick: string, uuid: string, role: Role, socket: WebSocket): Participant;
}

@injectable()
export class FactoryService implements IFactoryService {

  //#region  Constructor & C°
  // public constructor() { }
  //#endregion

  //#region  Interface IFactoryService methods
  public dummyGame(): IGame {
    return new Game('dummy');
  }

  public dummyParticipant(socket: WebSocket): Participant {
    const result = new Participant('dummy', '', Role.Unknown, socket);
    result.status = ParticipantStatus.Disconnected;
    return result;
  }

  public newGame(team: string): IGame {
    return new Game(team);
  }

  public newParticipant(nick: string, uuid: string, role: Role, socket: WebSocket) {
    return new Participant(nick, uuid, role, socket);
  }

  //#endregion
}
