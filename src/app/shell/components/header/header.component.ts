import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { versionInfo } from '@core/services/version-info';
import { ESessionStatus, SessionService } from '@shared/services';

@Component({
  selector: 'shell-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  //#region Private properties ------------------------------------------------
  private readonly sessionService: SessionService;
  private readonly translateService: TranslateService;
  //#endregion

  //#region Allowed actions getter --------------------------------------------
  public get canNavigate(): boolean {
    return this.sessionService.status === ESessionStatus.Inactive;
  }
  //#endregion

  //#region Label getter methods ----------------------------------------------
  public get routeLabelHome(): string {
    return this.translateService.instant('Navigation.RouteLabel.Home');
  }

  public get routeLabelPrivacy(): string {
    return this.translateService.instant('Navigation.RouteLabel.Privacy');
  }

  public get routeLabelLegal(): string {
    return this.translateService.instant('Navigation.RouteLabel.Legal');
  }

  public get version(): string {
    return `Planning-poker v${versionInfo.version}`;
  }
  //#endregion

  //#region Constructor and C° ------------------------------------------------
  constructor(sessionService: SessionService, translateService: TranslateService) {
    this.sessionService = sessionService;
    this.translateService = translateService;
  }
  //#endregion
}
