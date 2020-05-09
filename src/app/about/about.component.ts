import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { environment } from '@env/environment';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  // <editor-fold desc='Public getter properties'>
  public get version(): string | null {
    return environment.version;
  }

  public get applicationName() {
    return this.translateService.instant('About.Component.ApplicationName');
  }

  public get versionLabel(): string {
    return this.translateService.instant('About.Component.Label.Version');
  }
  // </editor-fold>

  // <editor-fold desc='Constructor &C°'>
  constructor(private translateService: TranslateService) { }
  // </editor-fold>

  // <editor-fold desc='Angular interface methods'>
  ngOnInit() { }
  // </editor-fold>

}
