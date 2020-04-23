import * as Collections from 'typescript-collections';
import { v4 as Uuid } from 'uuid';

import { GameStatus, Role } from '../../../../shared-lib/lib';

import { Estimation } from './estimation';
import { Participant } from './participant';

// TODO (694) create an interface
export class Game {

  // <editor-fold desc='Private properties'>
  private participants: Collections.Dictionary<string, Participant>;
  private estimations: Collections.Dictionary<string, Estimation>;
  private gameStatus: GameStatus;
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public static dummyGame(): Game {
    return new Game('dummy');
  }

  public constructor(public team: string) {
    this.team = team;
    this.gameStatus = GameStatus.Stopped;
    this.participants = new Collections.Dictionary<string, Participant>();
    this.estimations = new Collections.Dictionary<string, Estimation>();
  }
  // </editor-fold>

  // <editor-fold desc='Public GameStatus related methods'>
  public get status(): GameStatus {
    return this.gameStatus;
  }

  public reveal(): void {
    this.gameStatus = GameStatus.Revealed;
  }

  public startEstimating(): void {
    this.estimations = new Collections.Dictionary<string, Estimation>();
    this.gameStatus = GameStatus.Started;
  }

  // </editor-fold>

  // <editor-fold desc='Public estimation related methods'>
  public allEstimations(): Array<Estimation> {
    return this.estimations.values();
  }

  public deleteEstimation(estimation: Estimation) {
    this.estimations.remove(estimation.uuid);
  }

  public upsertEstimation(estimation: Estimation) {
    this.estimations.setValue(estimation.uuid, estimation);
  }
  // </editor-fold>

  // <editor-fold desc='Public participant related methods'>
  public allParticipants(): Array<Participant> {
    return this.participants.values();
  }

  // insert a new participant or update an existing one
  public upsertParticipant(participant: Participant) {
    this.participants.setValue(participant.uuid, participant);
  }

  // remove a participant from the game
  public deleteParticipant(uuid: string): void {
    this.participants.remove(uuid);
  }

  // the number of participants
  public size(): number {
    return this.participants.size();
  }

  public getParticipant(uuid: string): Participant | undefined {
    return this.participants.getValue(uuid);
  }

  public filterParticipants(filter: (participant: Participant) => boolean): Array<Participant> {
    return this.participants.values().filter(filter);
  }
  // </editor-fold>


}
