import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  //#region Private readonly properties ---------------------------------------
  private readonly nickKey: string = 'current_nick';
  private readonly teamKey: string = 'current_team';
  private readonly uuidKey: string = 'current_uuid';
  private _nick: string | null;
  private _team: string | null;
  private _uuid: string | null;
  //#endregion

  //#region getters/setters ---------------------------------------------------
  public get nick(): string | null {
    return this._nick;
  }

  public set nick(value: string | null) {
    this._nick = value;
    if (value){
      localStorage.setItem(this.nickKey, value);
    } else {
      localStorage.removeItem(this.nickKey);
    }
  }

  public get team(): string | null {
    return this._team;
  }

  public set team(value: string | null) {
    this._team = value;
    if (value) {
      localStorage.setItem(this.teamKey, value);
    } else {
      localStorage.removeItem(this.teamKey);
    }
  }

  public get uuid(): string | null {
    return this._uuid;
  }

  public set uuid(value: string | null) {
    this._uuid = value;
    if (value) {
      localStorage.setItem(this.uuidKey, value);
    } else {
      localStorage.removeItem(this.uuidKey);
    }
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  constructor() {
    this._nick = localStorage.getItem(this.nickKey);
    this._team = localStorage.getItem(this.teamKey);
    this._uuid = localStorage.getItem(this.uuidKey);
  }
  //#endregion

  //#region public methods -----------------------------------------------------
  public clear(): void {
    this.nick = null;
    this.team = null;
    this.uuid = null;
  }
  //#endregion
}
