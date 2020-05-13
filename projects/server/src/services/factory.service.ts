import { injectable, inject } from 'inversify';
import 'reflect-metadata';

import { DtoParticipant, ParticipantStatus, Role } from '../../../shared-lib/lib';

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

  // <editor-fold desc='Constructor & C°'>
  public constructor() { }
  // </editor-fold>

  // <editor-fold desc='Interface IFactoryService methods'>
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

  // </editor-fold>
}
