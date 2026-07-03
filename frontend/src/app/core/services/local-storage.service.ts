import { Service } from '@angular/core';

@Service()
export class LocalStorageService {
  //#region Private readonly fields -------------------------------------------
  private readonly currentLanguageKey: string = 'current_lang';
  private readonly nickKey: string = 'current_nick';
  private readonly teamNameKey: string = 'current_teamName';
  private readonly participantIdKey: string = 'current_participantId';
  //#endregion

  //#region Properties backing fields -----------------------------------------
  private _currentLang: string | null;
  private _nick: string | null;
  private _teamName: string | null;
  private _participantId: string | null;
  //#endregion

  //#region getters/setters ---------------------------------------------------
  public get currentLang(): string | null {
    return this._currentLang;
  }

  public set currentLang(value: string | null) {
    this._currentLang = value;
    if (value) {
      localStorage.setItem(this.currentLanguageKey, value);
    } else {
      localStorage.removeItem(this.currentLanguageKey);
    }
  }
  public get nick(): string | null {
    return this._nick;
  }

  public set nick(value: string | null) {
    this._nick = value;
    if (value) {
      localStorage.setItem(this.nickKey, value);
    } else {
      localStorage.removeItem(this.nickKey);
    }
  }

  public get teamName(): string | null {
    return this._teamName;
  }

  public set teamName(value: string | null) {
    this._teamName = value;
    if (value) {
      localStorage.setItem(this.teamNameKey, value);
    } else {
      localStorage.removeItem(this.teamNameKey);
    }
  }

  public get participantId(): string | null {
    return this._participantId;
  }

  public set participantId(value: string | null) {
    this._participantId = value;
    if (value) {
      localStorage.setItem(this.participantIdKey, value);
    } else {
      localStorage.removeItem(this.participantIdKey);
    }
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  constructor() {
    this._currentLang = localStorage.getItem(this.currentLanguageKey);
    this._nick = localStorage.getItem(this.nickKey);
    this._teamName = localStorage.getItem(this.teamNameKey);
    this._participantId = localStorage.getItem(this.participantIdKey);
  }
  //#endregion

  //#region public methods -----------------------------------------------------
  /**
   * Clear localstorage, except for the current language
   */
  public clearSessionData(): void {
    this.nick = null;
    this.teamName = null;
    this.participantId = null;
  }
  /**
   * Clear complete local storage
   */
  public clearAll(): void {
    this.nick = null;
    this.teamName = null;
    this.participantId = null;
    this.currentLang = null;
  }
  //#endregion
}
