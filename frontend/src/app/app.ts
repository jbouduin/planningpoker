import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CreateComponent } from './features/team/create/create.component';
import { JoinComponent } from './features/team/join/join.component';
import { SessionService } from './core';
import { GameService } from './features/game/services/game.service';
import { TeamService } from './features/team/services/team.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CreateComponent, JoinComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('frontend');

  /**
   * Inject the core services so they are instantiated.
   * Later we can probably remove it
   */
  constructor(sessionService: SessionService, _gameService: GameService, _teamService: TeamService) {
    console.log(sessionService.teamName);
  }
}
