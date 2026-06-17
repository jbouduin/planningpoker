import { Component, Input } from '@angular/core';

import { I18nService } from '@core/services/i18n.service';

@Component({
  selector: 'shell-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss']
})
export class LanguageSelectorComponent {
  @Input() icon = false;

  constructor(private i18nService: I18nService) { }

  // ngOnInit() {}

  setLanguage(language: string) {
    this.i18nService.language = language;
  }

  get currentLanguage(): string {
    return this.i18nService.language;
  }

  get languages(): Array<string> {
    return this.i18nService.supportedLanguages;
  }
}
