import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { MatSidenav } from '@angular/material/sidenav';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';

import { untilDestroyed } from '@core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {
  // <editor-fold desc='@ViewChild'>
  @ViewChild('sidenav', { static: false }) sidenav!: MatSidenav;
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
  constructor(
    private translateService: TranslateService,
    private media: MediaObserver) { }
  // </editor-fold>

  // <editor-fold desc='Angular interface methods'>
  public ngOnInit() {
    // Automatically close side menu on screens > sm breakpoint
    this.media
      .asObservable()
      .pipe(
        filter((changes: Array<MediaChange>) =>
          changes.some( change => change.mqAlias !== 'xs' && change.mqAlias !== 'sm')
        ),
        untilDestroyed(this)
      )
      .subscribe(() => this.sidenav.close());
  }

  public ngOnDestroy() {
    // Needed for automatic unsubscribe with untilDestroyed
  }
  // </editor-fold>
}
