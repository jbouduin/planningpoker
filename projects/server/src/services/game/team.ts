import { EPokerStatus } from '../../../../shared-lib/lib';

import { Estimation } from './estimation';
import { Participant } from './participant';

export interface ITeam {
  readonly allEstimations: Array<Estimation>;
  readonly allMembers: Array<Participant>;
  readonly status: EPokerStatus;
  teamName: string
  reveal(): void;
  startEstimating(): void;

  deleteEstimation(uuid: string): void;
  upsertEstimation(estimation: Estimation): void;

  removeMember(participantUuid: string): void;
  upsertMember(member: Participant): void;
  getMember(participantUuid: string): Participant | undefined;
  filterMembers(filter: (member: Participant) => boolean): Array<Participant>;
}

export class Team implements ITeam {

  //#region Private properties ------------------------------------------------
  private members: Map<string, Participant>;
  private estimations: Map<string, Estimation>;
  private pokerStatus: EPokerStatus;
  //#endregion

  //#region Public properties -------------------------------------------------
  public readonly teamName: string;
  public readonly unknownEstimationIndex: number;
  //#endregion

  //#region Public getters ----------------------------------------------------
  public get allMembers(): Array<Participant> {
    return Array.from(this.members.values());
  }

  public get allEstimations(): Array<Estimation> {
    return Array.from(this.estimations.values());
  }

  public get status(): EPokerStatus {
    return this.pokerStatus;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(teamName: string, unknownEstimationIndex: number) {
    this.teamName = teamName;
    this.unknownEstimationIndex = unknownEstimationIndex;
    this.pokerStatus = EPokerStatus.Cleared;
    this.members = new Map<string, Participant>();
    this.estimations = new Map<string, Estimation>();
  }
  //#endregion

  //#region Public GameStatus related methods ---------------------------------
  public reveal(): void {
    // TODO create ? estimations for missing estimations
    for (const member of this.members.values()) {
      if (Array.from(this.estimations.values()).findIndex((e: Estimation) => e.participantUuid === member.uuid) < 0) {
        this.estimations.set(member.uuid, new Estimation(member.uuid, this.unknownEstimationIndex));
      }
    }
    this.pokerStatus = EPokerStatus.Revealed;
  }

  public startEstimating(): void {
    this.estimations = new Map<string, Estimation>();
    this.pokerStatus = EPokerStatus.Started;
  }
  //#endregion

  //#region Public estimation related methods ---------------------------------
  public deleteEstimation(uuid: string): void {
    this.estimations.delete(uuid);
  }

  public upsertEstimation(estimation: Estimation): void {
    this.estimations.set(estimation.participantUuid, estimation);
  }
  //#endregion

  //#region Public participant related methods --------------------------------
  // insert a new participant as member or update an existing one
  public upsertMember(participant: Participant): void {
    this.members.set(participant.uuid, participant);
  }

  // remove a member from the team
  public removeMember(participantUuid: string): void {
    this.members.delete(participantUuid);
  }

  public getMember(participantUuid: string): Participant | undefined {
    return this.members.get(participantUuid);
  }

  public filterMembers(filter: (member: Participant) => boolean): Array<Participant> {
    const result = new Array<Participant>();
    for (const member of this.members.values()) {
      if (filter(member) === true) {
        result.push(member);
      }
    }
    return result;
  }
  //#endregion

}
