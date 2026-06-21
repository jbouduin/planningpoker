import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, effect, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { extract, ICanRejoinResult, SessionService, UiEventsService } from './core';
import { ApiService } from './core/services/api.service';
import { GameService } from './features/game/services/game.service';
import { CreateComponent } from './features/team/create/create.component';
import { JoinComponent } from './features/team/join/join.component';
import { TeamService } from './features/team/services/team.service';
import { DialogService } from './shared/service/dialog.service';
import { SnackbarService } from './shared/service/snackbar.service';
import { MatButtonModule } from '@angular/material/button';
import { MessageBoxParams } from './shared/components/message-box/message-box.params';

@Component({
  selector: 'app-root',
  imports: [MatButtonModule, CommonModule, RouterOutlet, CreateComponent, JoinComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  protected readonly gameSvc: GameService;
  protected readonly sessionSvc: SessionService;
  protected readonly teamSvc: TeamService;
  protected readonly title = signal('frontend');
  private readonly dialogSvc: DialogService;

  public constructor(
    sessionSvc: SessionService,
    gameSvc: GameService,
    teamSvc: TeamService,
    _apiSvc: ApiService,
    snackbarSvc: SnackbarService,
    uiEventsSvc: UiEventsService,
    dialogSvc: DialogService
  ) {
    this.gameSvc = gameSvc;
    this.sessionSvc = sessionSvc;
    this.teamSvc = teamSvc;
    this.dialogSvc = dialogSvc;
    effect(() => {
      const snackBarSignal = uiEventsSvc.snackbar();
      if (snackBarSignal !== null) {
        snackbarSvc.show(snackBarSignal);
        uiEventsSvc.snackbar.set(null);
      }
    });

    effect(() => {
      const simpleDialogSignal = uiEventsSvc.simpleDialog();
      if (simpleDialogSignal !== null) {
        dialogSvc.showSimpleDialog(simpleDialogSignal);
        uiEventsSvc.simpleDialog.set(null);
      }
    });
  }

  public ngAfterViewInit(): void {
    this.sessionSvc.canRejoin().subscribe((result: ICanRejoinResult) => {
      if (result.canRejoin) {
        const params = new MessageBoxParams();
        params.cancelButtonLabelKey = extract('Button.Generic.Label.No');
        params.okButtonLabelKey = extract('Button.Generic.Label.Yes');
        params.textKey = extract('MessageBox.Rejoin_$team_as_$nick.Text');
        params.textParams = {
          team: result.team,
          nick: result.nick
        };
        params.titleKey = extract('MessageBox.Rejoin_$team_as_$nick.Title');
        this.dialogSvc.showConfirmationDialog(params).subscribe((confirmed: boolean) => {
          if (confirmed) {
            this.sessionSvc.rejoin(result.team!, result.participantId!);
          } else {
            this.sessionSvc.leave(); // this currently throws an error, we could introduce a new method: leaveFromDisconnected(...)
          }
        });
      } else {
        this.sessionSvc.clearSessionData();
      }
    });
  }

  public leave(): void {
    const params = new MessageBoxParams();
    params.cancelButtonLabelKey = extract('Button.Generic.Label.No');
    params.okButtonLabelKey = extract('Button.Generic.Label.Yes');
    params.textKey = extract('MessageBox.Do_you_want_to_end_the_session.Text');
    params.titleKey = extract('MessageBox.Do_you_want_to_end_the_session.Title');
    this.dialogSvc.showConfirmationDialog(params).subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.sessionSvc.leave();
      }
    });
  }
}
