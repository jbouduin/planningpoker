import { Component, OnInit, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  // <editor-fold desc='@Input'>
  @Input() sidenav!: MatSidenav;
  // </editor-fold>

  // <editor-fold desc='Public getter methods'>
  public get routeLabelHome(): string {
    return this.translateService.instant('Navigation.RouteLabel.Home');
  }

  public get routeLabelAbout(): string {
    return this.translateService.instant('Navigation.RouteLabel.About');
  }
  // </editor-fold>

  // <editor-fold desc='Constructor and C°'>
  constructor(private translateService: TranslateService) { }
  // </editor-fold>

  // <editor-fold desc='Angular interface methods'>
  ngOnInit() {}
  // </editor-fold>


}
