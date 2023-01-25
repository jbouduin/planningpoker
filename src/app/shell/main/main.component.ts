import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'shell-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnDestroy {
  //#region private properties ------------------------------------------------
  private _mobileQueryListener: (event: MediaQueryListEvent) => void;
  private translateService: TranslateService
  //#endregion

  //#region public properties -------------------------------------------------
  public mobileQuery: MediaQueryList;
  //#endregion

  //#region Public getter methods ---------------------------------------------
  public get routeLabelHome(): string {
    return this.translateService.instant('Navigation.RouteLabel.Home');
  }

  public get routeLabelAbout(): string {
    return this.translateService.instant('Navigation.RouteLabel.About');
  }
  //#endregion

  //#region Constructor and C° ------------------------------------------------
  constructor(
    translateService: TranslateService,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher
  ) {
    this.translateService = translateService;
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = (_event: MediaQueryListEvent) => changeDetectorRef.detectChanges();
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);
  }
  //#endregion

  //#region Angular interface methods -----------------------------------------
  public ngOnDestroy() {
    this.mobileQuery.removeEventListener('change', this._mobileQueryListener);
  }
  //#endregion
}
