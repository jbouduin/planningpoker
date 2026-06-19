import { Injectable } from '@angular/core';
import { Logger } from './logger';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

import deDE from '../../../translations/de-DE.json';
import enUS from '../../../translations/en-US.json';
import { Subscription } from 'rxjs';
import { LocalStorageService } from './local-storage.service';

/**
 * Pass-through function to mark a string for translation extraction.
 * Running `npm translations:extract` will include the given string by using this.
 * @param s The string to extract for translation.
 * @return The same string.
 */
export function extract(s: string) {
  return s;
}

@Injectable({ providedIn: 'root' })
export class I18nService {
  //#region Private readonly properties ---------------------------------------
  private readonly log: Logger;
  private readonly localStorage: LocalStorageService;
  private readonly translateService: TranslateService;
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
    return this.translateService.getCurrentLang() || this.defaultLanguage;
  }
  /**
   * Sets the current language.
   * Note: The current language is saved to the local storage.
   * If no parameter is specified, the language is loaded from local storage (if present).
   * @param language The IETF language code to set.
   */

  public set language(language: string) {
    language = language || this.localStorage.currentLang || this.translateService.getBrowserCultureLang() || '';
    let isSupportedLanguage = this.supportedLanguages.includes(language);

    // If no exact match is found, search without the region
    if (language && !isSupportedLanguage) {
      language = language.split('-')[0];
      language = this.supportedLanguages.find(supportedLanguage => supportedLanguage.startsWith(language)) || '';
      isSupportedLanguage = Boolean(language);
    }

    // Fallback if language is not supported
    if (!isSupportedLanguage) {
      language = this.defaultLanguage;
    }

    this.log.debug(`Language set to ${language}`);
    this.translateService.use(language);
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(localStorage: LocalStorageService, translateService: TranslateService) {
    this.log = new Logger("I18nService");

    this.localStorage = localStorage;
    this.translateService = translateService;
    // Embed languages to avoid extra HTTP requests → should this be in constructor ?
    translateService.setTranslation('de-DE', deDE);
    translateService.setTranslation('en-US', enUS);
  }

  public destroy() {
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
  public init(defaultLanguage: string, supportedLanguages: Array<string>) {
    this.defaultLanguage = defaultLanguage;
    this.supportedLanguages = supportedLanguages;
    this.language = '';

    // Warning: this subscription will always be alive for the app's lifetime
    this.langChangeSubscription = this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
      this.localStorage.currentLang = event.lang;
    });
  }
  //#endregion
}
