import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ICanRejoinResult, LocalStorageService, SessionService } from './core';
import { ApiService } from './core/services/api.service';
import { GameService } from './features/game/services/game.service';
import { CreateComponent } from './features/team/create/create.component';
import { JoinComponent } from './features/team/join/join.component';
import { TeamService } from './features/team/services/team.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, CreateComponent, JoinComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  private readonly localStorageSvc: LocalStorageService;
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
    localStorageSvc: LocalStorageService
  ) {
    this.gameSvc = gameSvc;
    this.localStorageSvc = localStorageSvc;
    this.sessionSvc = sessionSvc;
    this.teamSvc = teamSvc;
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
