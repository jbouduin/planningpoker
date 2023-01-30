import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'about-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent {

  //#region Public getter properties ------------------------------------------
  public get version(): string | null {
    return "Version";
  }

  public get applicationName() {
    return this.translateService.instant('About.Component.ApplicationName');
  }

  public get versionLabel(): string {
    return this.translateService.instant('About.Component.Label.Version');
  }
  //#endregion

  //#region Constructor &C° ---------------------------------------------------
  constructor(private translateService: TranslateService) { }
  //#endregion
}
