import { effect, inject, Service } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Logger } from './logger';
import { MessageDispatcherService } from './message-dispatcher.service';

@Service()
export class LocalStorageService {
  //#region Private readonly fields -------------------------------------------
  private readonly currentLanguageKey: string = 'current_lang';
  private readonly nickKey: string = 'current_nick';
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
  constructor() {
    const dispatcherSvc = inject(MessageDispatcherService);
    const translateSvc = inject(TranslateService);
    this.log = new Logger('LocalStorageService');
    this.createEffects(dispatcherSvc, translateSvc);
  }

  private createEffects(dispatcherSvc: MessageDispatcherService, translateSvc: TranslateService): void {
    effect(() => {
      const startHandshake = dispatcherSvc.startHandshake();
      if (startHandshake !== null) {
        console.log(`Storing participantId: ${startHandshake.participantId}`);
        localStorage.setItem(this.participantIdKey, startHandshake.participantId);
      }
    });

    effect(() => {
      const teamName = dispatcherSvc.teamName();
      if (teamName !== null) {
        this.log.debug(`Storing teamName: ${teamName}`);
        localStorage.setItem(this.teamNameKey, teamName);
      } else {
        this.log.debug(`Removing teamName`);
        localStorage.removeItem(this.teamNameKey);
      }
    });

    effect(() => {
      const self = dispatcherSvc.self();
      if (self !== null) {
        this.log.debug(`Storing nick: ${self.nick}`);
        localStorage.setItem(this.nickKey, self.nick);
      } else {
        this.log.debug(`Removing nick`);
        localStorage.removeItem(this.nickKey);
      }
    });

    effect(() => {
      const endSession = dispatcherSvc.sessionEnded();
      if (endSession != null) {
        this.clearSessionData();
      }
    });

    effect(() => {
      const currentLang = translateSvc.currentLang();
      if (currentLang !== null) {
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
