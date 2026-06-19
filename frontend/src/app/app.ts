import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Create } from './features/team/create/create';
import { Join } from './features/team/join/join';
import { SessionService } from './core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Create, Join],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('frontend');

  constructor(sessionService: SessionService) {
    console.log(sessionService.teamName);
  }
}
