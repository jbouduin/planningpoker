import { AfterViewInit, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Params } from '@angular/router';
import { ICanRejoinResult } from '@shared/services';
import { TranslateService } from '@ngx-translate/core';

import { MessageBoxComponent, MessageBoxParams } from '@shared/components';
import { SessionService } from '@shared/services';

@Component({
  selector: 'home-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements AfterViewInit {

  //#region private properties ------------------------------------------------
  private readonly dialog: MatDialog;
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
    route: ActivatedRoute,
    sessionService: SessionService,
    translateService: TranslateService) {
    this.dialog = dialog;
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
    console.log('afterviewinit landing component');
    this.sessionService.canRejoin().subscribe((result: ICanRejoinResult) => {
      if (result.canRejoin) {
        const params = new MessageBoxParams();
        params.cancelButtonLabel = this.translateService.instant('Button.Generic.Label.No');
        params.okButtonLabel = this.translateService.instant('Button.Generic.Label.Yes');
        params.text = this.translateService.instant(
          'MessageBox.Rejoin_$team_as_$nick.Text',
          {
            team: result.team,
            nick: result.nick
          });
        params.title = this.translateService.instant('MessageBox.Rejoin_$team_as_$nick.Title');

        const dialogRef = this.dialog.open(MessageBoxComponent, {
          width: '350px',
          data: params
        });
        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            this.sessionService.rejoin();
          } else {
            this.sessionService.quitSession();
          }
        });
      } else {
        this.sessionService.clearSessionData();
      }
    });
  }
  //#endregion
}


