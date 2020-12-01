import { Component, OnInit, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  //#region  @Input
  @Input() sidenav!: MatSidenav;
  //#endregion

  //#region  Private properties
  private _headerLogoStyle: object;
  //#endregion

  //#region  Public getter methods
  public get headerLogoStyle(): object {
    return this._headerLogoStyle;
  }
  public get routeLabelHome(): string {
    return this.translateService.instant('Navigation.RouteLabel.Home');
  }

  public get routeLabelAbout(): string {
    return this.translateService.instant('Navigation.RouteLabel.About');
  }
  //#endregion

  //#region  Constructor and C°
  constructor(private translateService: TranslateService) {
    this._headerLogoStyle = {
      'background-image': `url('assets/logo_40x40.png)`,
      'background-position': 'center center',
      'background-size': '40px 40px',
      'background-repeat': 'no-repeat'
      // 'margin-left': '-5px'
    };
  }
  //#endregion

  //#region  Angular interface methods
  ngOnInit() { }
  //#endregion


}
