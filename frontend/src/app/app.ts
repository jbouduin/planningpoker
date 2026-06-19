import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SessionService } from './core';
import { GameService } from './features/game/services/game.service';
import { CreateComponent } from './features/team/create/create.component';
import { JoinComponent } from './features/team/join/join.component';
import { TeamService } from './features/team/services/team.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CreateComponent, JoinComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  // private readonly i18nService: I18nService;
  protected readonly title = signal('frontend');

  /**
   * Inject the core services so they are instantiated.
   * Later we can probably remove it
   */
  constructor(_sessionService: SessionService, _gameService: GameService, _teamService: TeamService) {

  }
}
