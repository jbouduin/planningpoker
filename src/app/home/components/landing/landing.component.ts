import { AfterViewInit, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

import { MessageBoxComponent, MessageBoxParams, HttpService, LocalStorageService } from '@app/@shared';
import { SessionService } from '../../../session/services/session.service';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'home-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements AfterViewInit {

  //#region private properties ------------------------------------------------
  private readonly dialog: MatDialog;
  private readonly httpService: HttpService;
  private readonly localStorageService: LocalStorageService;
  private readonly sessionService: SessionService;
  private readonly translateService: TranslateService;
  public teamParam?: string;
  //#endregion

  //#region public properties -------------------------------------------------
  public get showCreate(): boolean {
    return this.teamParam === undefined;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    dialog: MatDialog,
    httpService: HttpService,
    localStorageService: LocalStorageService,
    route: ActivatedRoute,
    sessionService: SessionService,
    translateService: TranslateService) {
    this.dialog = dialog;
    this.httpService = httpService;
    this.localStorageService = localStorageService;
    route.queryParams.subscribe((params: Params) => {
      if (params.team) {
        this.teamParam = params.team;
      }
    }).unsubscribe();
    this.sessionService = sessionService;
    this.translateService = translateService;
  }
  //#endregion

  //#region Angular interface members -----------------------------------------
  public ngAfterViewInit() {
    console.log('afterviewinit');
    const myUuid = this.localStorageService.uuid;
    const team = this.localStorageService.team;
    const nick = this.localStorageService.nick
    if (team &&  nick && myUuid) {
      this.httpService.checkCanRejoin(team, myUuid).subscribe((exists: boolean) => {
        if (exists) {
          const params = new MessageBoxParams();
          params.cancelButtonLabel = this.translateService.instant('Button.Generic.Label.No');
          params.okButtonLabel = this.translateService.instant('Button.Generic.Label.Yes');
          params.text = this.translateService.instant(
            'Home.Component.Question.Rejoin_$team_as_$nick',
            {
              team: team,
              nick: nick
            });
          params.title = this.translateService.instant('Dialog.Confirm.Title.Rejoin');

          const dialogRef = this.dialog.open(MessageBoxComponent, {
            width: '350px',
            data: params
          });
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              this.sessionService.rejoin(team, myUuid);
            } else {
              this.sessionService.leave(team, myUuid);
              this.localStorageService.clear();
            }
          });
        } else {
          this.localStorageService.clear();
        }
      });
    }
  }
  //#endregion
}


