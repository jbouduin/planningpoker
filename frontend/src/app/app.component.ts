import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, effect, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ICanRejoinResult, SessionService, UiEventsService } from './core';
import { ApiService } from './core/services/api.service';
import { GameService } from './features/game/services/game.service';
import { CreateComponent } from './features/team/create/create.component';
import { JoinComponent } from './features/team/join/join.component';
import { TeamService } from './features/team/services/team.service';
import { SnackbarService } from './shared/service/snackbar.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, CreateComponent, JoinComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  // private readonly localStorageSvc: LocalStorageService;
  // private readonly snackbarSvc: SnackbarService;
  protected readonly gameSvc: GameService;
  protected readonly sessionSvc: SessionService;
  protected readonly teamSvc: TeamService;
  protected readonly title = signal('frontend');

  /**
   * Inject the core services so they are instantiated.
   * Later we can probably remove it
   */
  constructor(
    sessionSvc: SessionService,
    gameSvc: GameService,
    teamSvc: TeamService,
    _apiSvc: ApiService,
    snackbarSvc: SnackbarService,
    uiEventsSvc: UiEventsService
    // localStorageSvc: LocalStorageService
  ) {
    // this.localStorageSvc = localStorageSvc;
    // this.snackbarSvc = snackbarSvc;
    this.gameSvc = gameSvc;
    this.sessionSvc = sessionSvc;
    this.teamSvc = teamSvc;
    effect(() => {
      const snackBarSignal = uiEventsSvc.snackbar();
      if (snackBarSignal !== null) {
        snackbarSvc.show(snackBarSignal);
        uiEventsSvc.snackbar.set(null);
      }
    });
  }

  public ngAfterViewInit(): void {
    this.sessionSvc.canRejoin().subscribe((result: ICanRejoinResult) => {
      if (result.canRejoin) {
        // eslint-disable-next-line no-console
        console.log(result);
        // const params = new MessageBoxParams();
        // params.cancelButtonLabel = this.translateService.instant('Button.Generic.Label.No');
        // params.okButtonLabel = this.translateService.instant('Button.Generic.Label.Yes');
        // params.text = this.translateService.instant(
        //   'MessageBox.Rejoin_$team_as_$nick.Text',
        //   {
        //     team: result.team,
        //     nick: result.nick
        //   });
        // params.title = this.translateService.instant('MessageBox.Rejoin_$team_as_$nick.Title');

        // const dialogRef = this.dialog.open(MessageBoxComponent, {
        //   width: '350px',
        //   data: params
        // });
        // dialogRef.afterClosed().subscribe(result => {
        //   if (result) {
        //     this.sessionService.rejoin();
        //   } else {
        //     this.sessionService.quitSession();
        //   }
        // });
        this.sessionSvc.rejoin(result.team!, result.participantId!);
      } else {
        this.sessionSvc.clearSessionData();
      }
    });
  }
}
