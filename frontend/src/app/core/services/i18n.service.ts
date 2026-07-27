import { inject, Service } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { map, Observable } from 'rxjs';
import { ENVIRONMENT } from '../../../environments/environment';
import { LocalStorageService } from './local-storage.service';

@Service()
export class I18nService {
  //#region Private readonly fields -------------------------------------------
  private readonly localStorageSvc: LocalStorageService;
  private readonly translateSvc: TranslateService;
  //#endregion

  //#region Public readonly fields --------------------------------------------
  public readonly supportedLanguages;
  public readonly defaultLanguage;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    this.localStorageSvc = inject(LocalStorageService);
    this.translateSvc = inject(TranslateService);
    this.supportedLanguages = ENVIRONMENT.supportedLanguages;
    this.defaultLanguage = ENVIRONMENT.defaultLanguage;
  }
  //#endregion

  //#region public methods -----------------------------------------------------
  public init(): Observable<void> {
    const lang = this.getInitialLanguage();
    return this.translateSvc.use(lang).pipe(map(() => void 0));
  }

  public changeLang(newLang: string): void {
    this.translateSvc.use(newLang);
  }

  public get currentLang(): string {
    return this.translateSvc.getCurrentLang()!;
  }
  //#endregion

  //#region Auxiliary methods -------------------------------------------------
  private getInitialLanguage(): string {
    const fromStorage = this.localStorageSvc.currentLang;
    let browser = navigator.language;
    const toUse = fromStorage || browser || this.defaultLanguage;
    return this.supportedLanguages.includes(toUse) ? toUse : this.defaultLanguage;
  }
  //#endregion
}
