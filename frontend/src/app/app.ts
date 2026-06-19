import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Create } from './features/team/create/create';
import { Join } from './features/team/join/join';
import { SessionService } from './core';
import { GameService } from './features/game/services/game.service';
import { TeamService } from './features/team/services/team.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Create, Join],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('frontend');

  /**
   * Inject the core services so they are instantiated.
   * Later we can probably remove it
   * @param sessionService
   */
  constructor(sessionService: SessionService, _gameService: GameService, _teamService: TeamService) {
    console.log(sessionService.teamName);
  }
}
