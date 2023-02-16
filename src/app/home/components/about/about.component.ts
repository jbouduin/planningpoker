import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Data, NavigationEnd, Router } from '@angular/router';
import { untilDestroyed } from '@app/@core';
import { HttpService } from '@app/@shared';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { filter, map, merge, Subscription, switchMap } from 'rxjs';

@Component({
  selector: 'home-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnDestroy{

  //#region private properties -----------------------------------------------
  private readonly langChangeSubscription: Subscription;
  private readonly routerSubscription: Subscription;
  private readonly httpService: HttpService;
  private currentContent: string;
  private currentLang: string;
  private _content: string;
  //#endregion

  //#region Public getter properties ------------------------------------------
  public get content(): string {
    return this._content;
  }

  //#endregion

  //#region Constructor &C° ---------------------------------------------------
  constructor(
    activatedRoute: ActivatedRoute,
    httpService: HttpService,
    translateService: TranslateService) {
    this.httpService = httpService;
    this.currentContent = '';
    this._content = '';
    this.currentLang = translateService.currentLang;
    this.langChangeSubscription = translateService.onLangChange
      .subscribe((value: LangChangeEvent) => this.processSubscriptions(value.lang, this.currentContent));
    this.routerSubscription = activatedRoute.data
      .subscribe((data: Data) => this.processSubscriptions(this.currentLang, data.content));
    this.httpService.getContent.subscribe((content: string) => this._content = content);
  }

  public ngOnDestroy(): void {
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }

    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
  //#endregion

  //#region private methods ---------------------------------------------------
  private processSubscriptions(lang: string, url: string): void {
    if (lang !== this.currentLang || url !== this.currentContent) {
      this.currentLang = lang;
      this.currentContent = url;

      this.httpService.currentPath = `${this.currentLang}/${this.currentContent === 'privacy' ? 'privacy-policy.md' : 'imprint.md'}`
      console.log(`${this.currentLang} ${this.currentContent}`);
    }
  }
  //#endregion
}
