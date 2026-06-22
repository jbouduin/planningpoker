import { effect, inject, Service } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom, map } from 'rxjs';
import { LocalStorageService } from './local-storage.service';

@Service()
export class I18nService {
  //#region Private readonly properties ---------------------------------------
  private readonly localStorageSvc: LocalStorageService;
  private readonly translateSvc: TranslateService;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    this.localStorageSvc = inject(LocalStorageService);
    this.translateSvc = inject(TranslateService);
    effect(() => {
      const currentLang = this.translateSvc.currentLang();
      if (currentLang !== null) {
        this.localStorageSvc.currentLang = currentLang;
      }
    });
  }
  //#endregion

  //#region public methods -----------------------------------------------------
  public init(): Promise<void> {
    const lang = this.getInitialLanguage();
    return firstValueFrom<void>(this.translateSvc.use(lang).pipe(map(() => void 0)));
  }

  public changeLang(newLang: string): void {
    this.translateSvc.use(newLang);
  }
  //#endregion

  //#region Auxiliary methods -------------------------------------------------
  private getInitialLanguage(): string {
    const fromStorage = this.localStorageSvc.currentLang;
    let browser = navigator.language;
    // TODO use environment.ts instead of hardcoding
    const defaultLanguage = 'en-US';
    const supportedLanguages = ['de-DE', 'en-US'];
    const toUse = fromStorage || browser || 'en-US';
    return supportedLanguages.includes(toUse) ? toUse : defaultLanguage;
  }
  //#endregion
}
