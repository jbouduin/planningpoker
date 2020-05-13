import * as Collections from 'typescript-collections';
import { v4 as Uuid } from 'uuid';

import { GameStatus, Role } from '../../../../shared-lib/lib';

import { Estimation } from './estimation';
import { Participant } from './participant';

export interface IGame {
  readonly allEstimations: Array<Estimation>;
  readonly allParticipants: Array<Participant>;
  readonly status: GameStatus;
  team: string
  reveal(): void;
  startEstimating(): void;

  deleteEstimation(uuid: string): void;
  upsertEstimation(estimation: Estimation): void;

  deleteParticipant(uuid: string): void;
  upsertParticipant(participant: Participant): void;
  getParticipant(uuid: string): Participant | undefined;
  filterParticipants(filter: (participant: Participant) => boolean): Array<Participant>;
}

export class Game implements IGame {

  // <editor-fold desc='Private properties'>
  private participants: Collections.Dictionary<string, Participant>;
  private estimations: Collections.Dictionary<string, Estimation>;
  private gameStatus: GameStatus;
  // </editor-fold>

  // <editor-fold desc='Public getter methods'>
  public get allParticipants(): Array<Participant> {
    return this.participants.values();
  }

  public get allEstimations(): Array<Estimation> {
    return this.estimations.values();
  }

  public get status(): GameStatus {
    return this.gameStatus;
  }
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor(public team: string) {
    this.team = team;
    this.gameStatus = GameStatus.Stopped;
    this.participants = new Collections.Dictionary<string, Participant>();
    this.estimations = new Collections.Dictionary<string, Estimation>();
  }
  // </editor-fold>

  // <editor-fold desc='Public GameStatus related methods'>
  public reveal(): void {
    this.gameStatus = GameStatus.Revealed;
  }

  public startEstimating(): void {
    this.estimations = new Collections.Dictionary<string, Estimation>();
    this.gameStatus = GameStatus.Started;
  }
  // </editor-fold>

  // <editor-fold desc='Public estimation related methods'>
  public deleteEstimation(uuid: string): void {
    this.estimations.remove(uuid);
  }

  public upsertEstimation(estimation: Estimation): void {
    this.estimations.setValue(estimation.uuid, estimation);
  }
  // </editor-fold>

  // <editor-fold desc='Public participant related methods'>
  // insert a new participant or update an existing one
  public upsertParticipant(participant: Participant): void {
    this.participants.setValue(participant.uuid, participant);
  }

  // remove a participant from the game
  public deleteParticipant(uuid: string): void {
    this.participants.remove(uuid);
  }

  public getParticipant(uuid: string): Participant | undefined {
    return this.participants.getValue(uuid);
  }

  public filterParticipants(filter: (participant: Participant) => boolean): Array<Participant> {
    return this.participants.values().filter(filter);
  }
  // </editor-fold>

}
