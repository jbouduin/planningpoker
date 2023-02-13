import { AfterViewInit, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent, ConfirmationDialogParams, HttpService, LocalStorageService } from '@app/@shared';
import { TranslateService } from '@ngx-translate/core';

import { SessionService } from '../session/services/session.service';

@Component({
  selector: 'home-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {

  //#region private properties ------------------------------------------------
  private readonly dialog: MatDialog;
  private readonly httpService: HttpService;
  private readonly localStorageService: LocalStorageService;
  private readonly sessionService: SessionService;
  private readonly translateService: TranslateService;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    dialog: MatDialog,
    httpService: HttpService,
    localStorageService: LocalStorageService,
    translateService: TranslateService,
    sessionService: SessionService) {
    this.dialog = dialog;
    this.httpService = httpService;
    this.localStorageService = localStorageService
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
          const params = new ConfirmationDialogParams();
          params.cancelButtonLabel = this.translateService.instant('Dialog.ButtonLabel.No');
          params.okButtonLabel = this.translateService.instant('Dialog.ButtonLabel.Yes');
          params.text = this.translateService.instant(
            'Home.Component.Question.Rejoin_$team_as_$nick',
            {
              team: team,
              nick: nick
            });
          params.title = this.translateService.instant('Dialog.Confirm.Title.Rejoin');

          const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
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


