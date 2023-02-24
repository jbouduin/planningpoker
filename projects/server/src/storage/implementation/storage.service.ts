import { injectable } from "inversify";
import { v4 as Uuid } from 'uuid';

import { EErrorCode, ERole, ICardSet, IParticipant } from "../../../../shared-lib/lib";
import { ITeam, LooseObject, Team } from "../../objects";
import { Participant } from "../../objects/participant";
import { IWebSocket } from "../../services/websocket";
import { IStorageService } from "../../storage/interfaces";

@injectable()
export class StorageService implements IStorageService {

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

  //#region IStorageService methods -------------------------------------------
  public canRejoin(uuid: string, teamName: string): EErrorCode {
    let result = EErrorCode.NoError;
    if (!this.teamExists(teamName)) {
      result = EErrorCode.TeamDoesNotExist;
    } else if (!this.participantExists(uuid)) {
      result = EErrorCode.ParticipantNotFound;
    } else if (!this.participantInTeam(uuid, teamName)) {
      result = EErrorCode.ParticipantNotInTeam;
    }
    return result;
  }

  public createParticipant(socket: IWebSocket): Participant {
    const result = new Participant(`participant ${++this.cnt}`, Uuid(), ERole.Unknown, socket);
    this.participants.set(result.uuid, result);
    return result;
  }

  public createTeam(teamName: string, cardSet: ICardSet): ITeam {
    const result = new Team(teamName, cardSet);
    this.teams.set(teamName, result);
    return result;
  }

  public deleteParticipant(participantUuid: string): void {
    const team = this.getTeamOfParticipant(participantUuid);
    if (team) {
      team.removeMember(participantUuid);
    }
    this.memberTeamMap.delete(participantUuid);
    this.participants.delete(participantUuid);
  }

  public deleteTeam(teamName: string): void {
    const team = this.getTeam(teamName)
    if (team){
      team.allMembers.forEach((m: Participant) => this.leaveTeam(team, m))
    }
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

  public filterTeams(filter: (team: ITeam) => boolean): Array<ITeam> {
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

  // TODO why do we not have a leave team? when we only call leave on the team, the map is not modified
  public joinTeam(team: ITeam, participant: Participant): void {
    this.memberTeamMap.set(participant.uuid, team.teamName);
    team.upsertMember(participant);
  }

  public leaveTeam(team: ITeam, participant: IParticipant): void {
    this.memberTeamMap.delete(participant.uuid);
    team.removeMember(participant.uuid);
  }

  public participantExists(uuid: string): boolean {
    return this.participants.has(uuid);
  }

  public participantInTeam(uuid: string, teamName: string): boolean {
    return this.memberTeamMap.get(uuid) === teamName;
  }

  public serializeAllTeams(): LooseObject {
    const result: LooseObject = {
      teams: new Array<LooseObject>()
    };

    for (const team of this.teams.values()) {
      const gameDump: LooseObject = {
        team: team.teamName,
        status: team.status,
        members: new Array<LooseObject>()
      }
      team.allMembers.forEach((menber: Participant) => gameDump.members.push({
        name: menber.nick,
        role: menber.role,
        status: menber.status,
        observer: menber.observer,
        uuid: menber.uuid
      }));
      result.teams.push(gameDump);
    }
    return result;
  }

  public serializeTeam(teamName: string): LooseObject {
    const team = this.teams.get(teamName);
    if (team) {
      const result: LooseObject = {
        team: team.teamName,
        status: team.status,
        members: new Array<LooseObject>()
      }
      team.allMembers.forEach((member: Participant) => result.members.push({
        name: member.nick,
        role: member.role,
        status: member.status,
        observer: member.observer,
        uuid: member.uuid
      }));
      return result;
    }
    else {
      return {
        error: EErrorCode.TeamDoesNotExist,
        errorMessage: `Team '${teamName}' not found`
      }
    }
  }

  public serializeParticipants(): LooseObject {
    const result = new Array<LooseObject>();
    for (const participant of this.participants.values()) {
      result.push({
        name: participant.nick,
        role: participant.role,
        status: participant.status,
        observer: participant.observer,
        uuid: participant.uuid
      })
    }
    return result;
  }

  public teamExists(teamName: string): boolean {
    return this.teams.has(teamName);
  }
  //#endregion
}