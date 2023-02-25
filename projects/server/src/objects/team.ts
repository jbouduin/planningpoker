import { EPokerStatus } from '../../../shared-lib/src';

import { Estimation } from './estimation';
import { Participant } from './participant';

export interface ITeam {
  // TODO NOW get rid of these two properties
  readonly estimations: Map<string, Estimation>;
  readonly teamMembers: Map<string, Participant>;
  status: EPokerStatus;
  teamName: string;
  lastAccessTime: number;
}

export class Team implements ITeam {

  //#region Private properties ------------------------------------------------
  private _teamMembers: Map<string, Participant>;
  private _estimations: Map<string, Estimation>;
  //#endregion

  //#region Public properties -------------------------------------------------
  public status: EPokerStatus;
  public lastAccessTime: number;
  public readonly teamName: string;
  //#endregion

  //#region Public getters ----------------------------------------------------
  public get teamMembers(): Map<string, Participant> {
    this.lastAccessTime = Date.now();
    return this._teamMembers;
  }

  public get estimations(): Map<string, Estimation> {
    this.lastAccessTime = Date.now();
    return this._estimations;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(teamName: string) {
    this.lastAccessTime = Date.now();
    this.teamName = teamName;
    this.status = EPokerStatus.Cleared;
    this._teamMembers = new Map<string, Participant>();
    this._estimations = new Map<string, Estimation>();

  }
  //#endregion




}
