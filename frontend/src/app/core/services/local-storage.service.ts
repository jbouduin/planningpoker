import { effect, inject, Service } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Logger } from './logger';
import { MessageDispatcherService } from './message-dispatcher.service';
import { LoggerService } from './logger.service';

@Service()
export class LocalStorageService {
  //#region Private readonly fields -------------------------------------------
  private readonly currentLanguageKey: string = 'current_lang';
  private readonly nickKey: string = 'current_nick';
  private readonly teamIdKey: string = 'current_teamId';
  private readonly teamNameKey: string = 'current_teamName';
  private readonly participantIdKey: string = 'current_participantId';
  private readonly log: Logger;
  //#endregion

  //#region getters -----------------------------------------------------------
  public get currentLang(): string | null {
    return localStorage.getItem(this.currentLanguageKey);
  }

  public get nick(): string | null {
    return localStorage.getItem(this.nickKey);
  }

  public get teamName(): string | null {
    return localStorage.getItem(this.teamNameKey);
  }

  public get participantId(): string | null {
    return localStorage.getItem(this.participantIdKey);
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    // --- Dependency Injection ---
    const dispatcherSvc = inject(MessageDispatcherService);
    const translateSvc = inject(TranslateService);
    this.log = inject(LoggerService).getLogger('LocalStorageService');

    // --- Initialization ---
    this.createEffects(dispatcherSvc, translateSvc);
  }

  private createEffects(dispatcherSvc: MessageDispatcherService, translateSvc: TranslateService): void {
    effect(() => {
      const startHandshake = dispatcherSvc.startHandshake();
      if (startHandshake !== null) {
        localStorage.setItem(this.participantIdKey, startHandshake.participantId);
      }
    });

    effect(() => {
      const team = dispatcherSvc.team();
      if (team !== null) {
        this.log.debug(`Storing teamId, teamName: ${team.teamId}, ${team.teamName}`);
        localStorage.setItem(this.teamNameKey, team.teamName);
        localStorage.setItem(this.teamIdKey, team.teamId);
      }
      // Removing is not executed -> it would disable automatic rejoin
    });

    effect(() => {
      const self = dispatcherSvc.self();
      if (self !== null) {
        this.log.debug(`Storing nick: ${self.nick}`);
        localStorage.setItem(this.nickKey, self.nick);
      }
      // Removing is not executed -> it would disable automatic rejoin
    });

    effect(() => {
      const endSession = dispatcherSvc.sessionEnded();
      if (endSession != null) {
        this.clearSessionData();
      }
    });

    effect(() => {
      const currentLang = translateSvc.currentLang();
      const storedLang = this.currentLang;
      if (currentLang !== null && currentLang !== storedLang) {
        this.log.debug(`Storing language: ${currentLang}`);
        localStorage.setItem(this.currentLanguageKey, currentLang);
      }
    });
  }
  //#endregion

  //#region public methods -----------------------------------------------------
  /**
   * Clear local storage, except for the current language
   */
  public clearSessionData(): void {
    this.log.debug('clearing session data');
    localStorage.removeItem(this.participantIdKey);
    localStorage.removeItem(this.teamIdKey);
    localStorage.removeItem(this.teamNameKey);
    localStorage.removeItem(this.nickKey);
  }
  /**
   * Clear complete local storage
   */
  public clearAll(): void {
    localStorage.removeItem(this.participantIdKey);
    localStorage.removeItem(this.teamNameKey);
    localStorage.removeItem(this.nickKey);
    localStorage.removeItem(this.currentLanguageKey);
  }
  //#endregion
}
