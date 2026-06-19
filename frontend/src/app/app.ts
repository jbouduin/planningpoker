import { AfterViewChecked, AfterViewInit, Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ICanRejoinResult, LocalStorageService, SessionService } from './core';
import { GameService } from './features/game/services/game.service';
import { CreateComponent } from './features/team/create/create.component';
import { JoinComponent } from './features/team/join/join.component';
import { TeamService } from './features/team/services/team.service';
import { ApiService } from './core/services/api.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CreateComponent, JoinComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements AfterViewInit{
  private readonly localStorageService: LocalStorageService;
  private readonly sessionService: SessionService;
  protected readonly title = signal('frontend');

  /**
   * Inject the core services so they are instantiated.
   * Later we can probably remove it
   */
  constructor(sessionService: SessionService, _gameService: GameService, _teamService: TeamService, _apiService: ApiService, localStorageService: LocalStorageService) {
    this.sessionService = sessionService;
    this.localStorageService = localStorageService;
  }

  public ngAfterViewInit(): void {
    console.log("in afterviewinit");
    this.sessionService.canRejoin().subscribe((result: ICanRejoinResult) => {
      if (result.canRejoin) {
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
        this.sessionService.rejoin(result.team!, result.participantId!)
      } else {
        this.sessionService.clearSessionData();
      }
    });
  }
}
