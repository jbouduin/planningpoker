import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { HttpService } from '@app/@shared';

@Component({
  selector: 'home-content-page',
  templateUrl: './content-page.component.html',
  styleUrls: ['./content-page.component.scss']
})
export class ContentPageComponent implements OnDestroy{

  //#region private properties -----------------------------------------------
  private readonly langChangeSubscription: Subscription;
  private readonly routerSubscription: Subscription;
  private readonly httpServiceSubscription: Subscription;
  private readonly httpService: HttpService;
  private currentContent: string;
  private currentLang: string;
  private _content: Array<string>;
  //#endregion

  //#region Public getter properties ------------------------------------------
  public get content(): Array<string> {
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
    this._content = new Array<string>;
    this.currentLang = translateService.currentLang;
    this.langChangeSubscription = translateService.onLangChange
      .subscribe((value: LangChangeEvent) => this.processSubscriptions(value.lang, this.currentContent));
    this.routerSubscription = activatedRoute.data
      .subscribe((data: Data) => this.processSubscriptions(this.currentLang, data.content));
    this.httpServiceSubscription = this.httpService.getContent
      .subscribe((response: [number, string]) => {
        console.log(response)
        this._content[response[0]] = response[1];
      });
  }

  public ngOnDestroy(): void {
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
    }

    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }

    if (this.httpServiceSubscription) {
      this.httpServiceSubscription.unsubscribe();
    }
  }
  //#endregion

  //#region private methods ---------------------------------------------------
  private processSubscriptions(lang: string, url: string): void {
    if (lang !== this.currentLang || url !== this.currentContent) {
      this.currentLang = lang;
      this.currentContent = url;
      this._content.splice(0);

      if (this.currentContent == 'privacy') {
        this.httpService.currentPath = [0, `${this.currentLang}/privacy-policy.md`];
        this.httpService.currentPath = [1, `${this.currentLang}/cookies.md`];
      } else if (this.currentContent == 'legal') {
        this.httpService.currentPath = [0, `${this.currentLang}/imprint.md`];
        this.httpService.currentPath = [1, `${this.currentLang}/caveat.md`];
      }

      console.log(`${this.currentLang} ${this.currentContent}`);
    }
  }
  //#endregion
}
