import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { SessionService } from '@app/session/services/session.service';

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
    return !this.sessionService.inSession;
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
  //#endregion

  //#region Constructor and C° ------------------------------------------------
  constructor(sessionService: SessionService, translateService: TranslateService) {
    this.sessionService = sessionService;
    this.translateService = translateService;
  }
  //#endregion
}
