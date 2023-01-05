import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { TranslateService } from '@ngx-translate/core';
// import { filter } from 'rxjs/operators';

// import { untilDestroyed } from '@core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {
  //#region  @ViewChild
  @ViewChild('sidenav', { static: false }) sidenav!: MatSidenav;
  //#endregion

  //#region  Public getter methods
  public get routeLabelHome(): string {
    return this.translateService.instant('Navigation.RouteLabel.Home');
  }

  public get routeLabelAbout(): string {
    return this.translateService.instant('Navigation.RouteLabel.About');
  }
  //#endregion

  //#region  Constructor and C°
  constructor(
    private translateService: TranslateService
    // ,
    // private media: MediaObserver
  ) { }
  //#endregion

  //#region  Angular interface methods
  public ngOnInit() {
    // Automatically close side menu on screens > sm breakpoint
    // this.media
    //   .asObservable()
    //   .pipe(
    //     filter((changes: Array<MediaChange>) =>
    //       changes.some( change => change.mqAlias !== 'xs' && change.mqAlias !== 'sm')
    //     ),
    //     untilDestroyed(this)
    //   )
    //   .subscribe(() => this.sidenav.close());
  }

  public ngOnDestroy() {
    // Needed for automatic unsubscribe with untilDestroyed
  }
  //#endregion
}
