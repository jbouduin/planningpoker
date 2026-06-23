import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { I18nService } from '../../../../core';

@Component({
  selector: 'app-language-selector',
  imports: [CommonModule, MatIconModule, MatMenuModule],
  templateUrl: './language-selector.component.html',
  styleUrl: './language-selector.component.scss'
})
export class LanguageSelectorComponent {
  //#region Input -------------------------------------------------------------
  // TODO check what this was
  @Input() icon = false;
  //#endregion

  //#region Private fields ----------------------------------------------------
  private readonly i18nSvc: I18nService;
  //#endregion

  //#region Public getters ----------------------------------------------------
  get currentLanguage(): string {
    return this.i18nSvc.currentLang;
  }

  get languages(): Array<string> {
    return this.i18nSvc.supportedLanguages;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(i18nSvc: I18nService) {
    this.i18nSvc = i18nSvc;
  }
  //#endregion

  //#region UI-triggers -------------------------------------------------------
  public setLanguage(value: string): void {
    this.i18nSvc.changeLang(value);
  }
  //#endregion
}
