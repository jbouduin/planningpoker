import { v4 as Uuid } from 'uuid';

import { injectable } from "inversify";
import { IWebSocket } from "../../services/websocket";
import { ERole } from "../../../../shared-lib/lib";

import { ITeam, Team } from "../../objects";
import { Participant } from "../../objects/participant";
import { IStorageService } from "../../storage/interfaces";

@injectable()
export class StorageService implements IStorageService{
  //#region Private properties ------------------------------------------------
  private readonly participants: Map<string, Participant>;
  private readonly memberTeamMap: Map<string, string>;
  private readonly teams: Map<string, ITeam>;
  private cnt: number;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    this.participants = new Map<string, Participant>();
    this.memberTeamMap = new Map<string, string>();
    this.teams = new Map<string, ITeam>();
    this.cnt = 0;
  }
  //#endregion

  public createParticipant(socket: IWebSocket): Participant {
    const result = new Participant(`participant ${++this.cnt}`, Uuid(), ERole.Unknown, socket);
    this.participants.set(result.uuid, result);
    return result;
  }

  public createTeam(teamName: string, unknownEstimationIndex: number): ITeam {
    const result = new Team(teamName, unknownEstimationIndex);
    this.teams.set(teamName, result);
    return result;
  }

  public deleteParticipant(participantUuid: string): void {
    this.memberTeamMap.delete(participantUuid);
    this.participants.delete(participantUuid);
  }

  public deleteTeam(teamName: string): void {
    this.teams.delete(teamName);
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

  public filterTeams(filter: (team: ITeam) => boolean): Array<ITeam>
  {
    const result = new Array<ITeam>();
    for (const team of this.teams.values()) {
      if (filter(team) === true) {
        result.push(team);
      }
    }
    return result;
  }

  public getParticipant(uuid: string): Participant | undefined {
    return this.participants.get(uuid);
  }

  public getTeam(teamName: string): ITeam | undefined {
    return this.teams.get(teamName);
  }

  public getTeamOfParticipant(participantUuid: string): ITeam | undefined {
    const gameName = this.memberTeamMap.get(participantUuid);
    return gameName ? this.teams.get(gameName) : undefined;
  }

  public joinTeam(participantUuid: string, teamName: string): void {
    this.memberTeamMap.set(participantUuid, teamName);
  }



  public participantExists(uuid: string): boolean {
    return this.participants.has(uuid);
  }

  public participantInTeam(uuid: string, teamName: string): boolean {
    return this.memberTeamMap.get(uuid) === teamName;
  }

  public teamExists(teamName: string): boolean {
    return this.teams.has(teamName);
  }
}