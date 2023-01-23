import { GameStatus } from '../../../../shared-lib/lib';

import { Estimation } from './estimation';
import { Participant } from './participant';

export interface ITeam {
  readonly allEstimations: Array<Estimation>;
  readonly allParticipants: Array<Participant>;
  readonly status: GameStatus;
  teamName: string
  reveal(): void;
  startEstimating(): void;

  deleteEstimation(uuid: string): void;
  upsertEstimation(estimation: Estimation): void;

  deleteParticipant(uuid: string): void;
  upsertParticipant(participant: Participant): void;
  getParticipant(uuid: string): Participant | undefined;
  filterParticipants(filter: (participant: Participant) => boolean): Array<Participant>;
}

export class Team implements ITeam {

  //#region Private properties ------------------------------------------------
  private participants: Map<string, Participant>;
  private estimations: Map<string, Estimation>;
  private gameStatus: GameStatus;
  //#endregion

  //#region Public getters ----------------------------------------------------
  public get allParticipants(): Array<Participant> {
    return Array.from(this.participants.values());
  }

  public get allEstimations(): Array<Estimation> {
    return Array.from(this.estimations.values());
  }

  public get status(): GameStatus {
    return this.gameStatus;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(public teamName: string) {
    this.teamName = teamName;
    this.gameStatus = GameStatus.Stopped;
    this.participants = new Map<string, Participant>();
    this.estimations = new Map<string, Estimation>();
  }
  //#endregion

  //#region Public GameStatus related methods ---------------------------------
  public reveal(): void {
    this.gameStatus = GameStatus.Revealed;
  }

  public startEstimating(): void {
    this.estimations = new Map<string, Estimation>();
    this.gameStatus = GameStatus.Started;
  }
  //#endregion

  //#region Public estimation related methods ---------------------------------
  public deleteEstimation(uuid: string): void {
    this.estimations.delete(uuid);
  }

  public upsertEstimation(estimation: Estimation): void {
    this.estimations.set(estimation.uuid, estimation);
  }
  //#endregion

  //#region Public participant related methods --------------------------------
  // insert a new participant or update an existing one
  public upsertParticipant(participant: Participant): void {
    this.participants.set(participant.uuid, participant);
  }

  // remove a participant from the game
  public deleteParticipant(uuid: string): void {
    this.participants.delete(uuid);
  }

  public getParticipant(uuid: string): Participant | undefined {
    return this.participants.get(uuid);
  }

  public filterParticipants(filter: (participant: Participant) => boolean): Array<Participant> {
    const result = new Array<Participant>();
    for (const participant of this.participants.values()) {
      if (filter(participant) === true) {
        result.push(participant);
      }
    }
    return result;
  }
  //#endregion

}
