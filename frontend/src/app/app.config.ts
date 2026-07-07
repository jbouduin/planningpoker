import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { forkJoin } from 'rxjs';
import { routes } from './app.routes';
import { CardSetService, I18nService, LocalStorageService } from './core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    provideTranslateService({
      lang: undefined,
      fallbackLang: undefined,
      loader: provideTranslateHttpLoader({
        prefix: '/i18n/',
        suffix: '.json'
      })
    }),
    provideAppInitializer(() => {
      inject(LocalStorageService); // not sure if this is required
      const i18n = inject(I18nService);
      const cardSetSvc = inject(CardSetService);

      return forkJoin([i18n.init(), cardSetSvc.init()]);
    }),
    provideAnimations()
  ]
};
