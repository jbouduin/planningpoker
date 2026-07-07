import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, Signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, of, switchMap } from 'rxjs';
import { ApiService, I18nService, MarkdownPipe } from '../../core';

@Component({
  selector: 'app-content',
  imports: [CommonModule, MatCardModule, MarkdownPipe],
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss'
})
export class ContentComponent {
  //#region Signals -----------------------------------------------------------
  protected readonly content: Signal<Array<string>>;
  //#endregion

  //#region Component Inputs --------------------------------------------------
  public readonly path = input.required<string>();
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    // --- Dependency injection ---
    const apiSvc = inject(ApiService);
    const translateSvc = inject(TranslateService);
    const i18nSvc = inject(I18nService);

    // --- Initialize ---
    const contentMap = new Map<string, Array<string>>([
      ['privacy', ['privacy-policy.md', 'cookies.md']],
      ['legal', ['imprint.md', 'caveat.md']]
    ]);

    const contentRequest = toObservable(
      computed(() => ({
        lang: translateSvc.currentLang() ?? i18nSvc.defaultLanguage,
        path: this.path()
      }))
    );

    this.content = toSignal(
      contentRequest.pipe(
        switchMap(({ lang, path }) => {
          const files = contentMap.get(path);
          if (files) {
            return forkJoin(files.map((f: string) => apiSvc.loadContent(lang, f)));
          } else {
            return of(new Array<string>());
          }
        })
      ),
      { initialValue: [] }
    );
  }
  //#endregion
}
