import { inject, Service } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Logger } from './logger';

import { Subscription } from 'rxjs';
import deDE from '../../../translations/de-DE.json';
import enUS from '../../../translations/en-US.json';
import { LocalStorageService } from './local-storage.service';

/**
 * Pass-through function to mark a string for translation extraction.
 * Running `npm translations:extract` will include the given string by using this.
 * @param s The string to extract for translation.
 * @return The same string.
 */
export function extract(s: string): string {
  return s;
}

@Service()
export class I18nService {
  //#region Private readonly properties ---------------------------------------
  private readonly log: Logger;
  private readonly localStorageSvc: LocalStorageService;
  private readonly translateSvc: TranslateService;
  //#endregion

  //#region private properties ------------------------------------------------
  private langChangeSubscription!: Subscription;
  private defaultLanguage!: string;
  private supportedLanguages!: Array<string>;
  //#endregion

  //#region Public getters/setters --------------------------------------------
  /**
   * Gets the current language.
   * @return The current language code.
   */
  public get language(): string {
    // TODO use the signal currentlang
    return this.translateSvc.getCurrentLang() || this.defaultLanguage;
  }
  /**
   * Sets the current language.
   * Note: The current language is saved to the local storage.
   * If no parameter is specified, the language is loaded from local storage (if present).
   * @param language The IETF language code to set.
   */

  public set language(language: string) {
    language = language || this.localStorageSvc.currentLang || this.translateSvc.getBrowserCultureLang() || '';
    let isSupportedLanguage = this.supportedLanguages.includes(language);

    // If no exact match is found, search without the region
    if (language && !isSupportedLanguage) {
      language = language.split('-')[0];
      language = this.supportedLanguages.find((supportedLanguage) => supportedLanguage.startsWith(language)) || '';
      isSupportedLanguage = Boolean(language);
    }

    // Fallback if language is not supported
    if (!isSupportedLanguage) {
      language = this.defaultLanguage;
    }

    this.log.debug(`Language set to ${language}`);
    this.translateSvc.use(language);
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    this.log = new Logger('I18nService');

    this.localStorageSvc = inject(LocalStorageService);
    this.translateSvc = inject(TranslateService);
    // Embed languages to avoid extra HTTP requests → should this be in constructor ?
    this.translateSvc.setTranslation('de-DE', deDE);
    this.translateSvc.setTranslation('en-US', enUS);
  }

  public destroy(): void {
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }
  }
  //#endregion

  //#region Public methods ----------------------------------------------------
  /**
   * Initializes i18n for the application.
   * @param defaultLanguage The default language to use.
   * @param supportedLanguages The list of supported languages.
   */
  public init(defaultLanguage: string, supportedLanguages: Array<string>): void {
    this.defaultLanguage = defaultLanguage;
    this.supportedLanguages = supportedLanguages;
    this.language = '';

    // Warning: this subscription will always be alive for the app's lifetime
    this.langChangeSubscription = this.translateSvc.onLangChange.subscribe((event: LangChangeEvent) => {
      this.localStorageSvc.currentLang = event.lang;
    });
  }
  //#endregion
}
