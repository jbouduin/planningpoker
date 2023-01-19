import { AfterViewInit, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent, ConfirmationDialogParams } from '@app/@shared';
// import { finalize } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import { GameService } from '../game/game.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {

  //#region private properties ------------------------------------------------
  private dialog: MatDialog;
  private translateService: TranslateService;
  private gameService: GameService;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(dialog: MatDialog, translateService: TranslateService, gameService: GameService) {
    this.dialog = dialog;
    this.translateService = translateService;
    this.gameService = gameService;
  }
  //#endregion

  //#region Angular interface members -----------------------------------------
  public ngAfterViewInit() {
    if (this.gameService.game.canReconnect) {
      const params = new ConfirmationDialogParams();
      params.cancelButtonLabel = this.translateService.instant('Dialog.ButtonLabel.No');
      params.okButtonLabel = this.translateService.instant('Dialog.ButtonLabel.Yes');
      params.text = this.translateService.instant(
        'Home.Component.Question.Rejoin_$team_as_$nick',
        {
          team: this.gameService.game.team,
          nick: this.gameService.game.myNick
        });
      params.title = this.translateService.instant('Dialog.Confirm.Title.Rejoin');

      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: '350px',
        data: params
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.gameService.rejoin();
        } else {
          this.gameService.leave();
        }
      });
    };
  }
  //#endregion
}


