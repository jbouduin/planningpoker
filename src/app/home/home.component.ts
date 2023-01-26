import { AfterViewInit, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent, ConfirmationDialogParams, HttpService } from '@app/@shared';
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
  private readonly httpService: HttpService
  private readonly sessionService: SessionService;
  private readonly translateService: TranslateService;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(dialog: MatDialog, translateService: TranslateService, sessionService: SessionService, httpService: HttpService) {
    this.dialog = dialog;
    this.httpService = httpService;
    this.translateService = translateService;
    this.sessionService = sessionService;
  }
  //#endregion

  //#region Angular interface members -----------------------------------------
  public ngAfterViewInit() {
    if (this.sessionService.game.canReconnect) {
      this.httpService.checkTeamExists(this.sessionService.game.team).subscribe((exists: boolean) => {
        if (exists) {
          const params = new ConfirmationDialogParams();
          params.cancelButtonLabel = this.translateService.instant('Dialog.ButtonLabel.No');
          params.okButtonLabel = this.translateService.instant('Dialog.ButtonLabel.Yes');
          params.text = this.translateService.instant(
            'Home.Component.Question.Rejoin_$team_as_$nick',
            {
              team: this.sessionService.game.team,
              nick: this.sessionService.game.myNick
            });
          params.title = this.translateService.instant('Dialog.Confirm.Title.Rejoin');

          const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '350px',
            data: params
          });
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              this.sessionService.rejoin();
            } else {
              this.sessionService.leave();
            }
          });
        } else {
          this.sessionService.reset();
        }
      });
    }
  }
  //#endregion
}


