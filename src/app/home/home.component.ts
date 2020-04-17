import { AfterViewInit, Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';

import { GameService } from '../@core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements AfterViewInit, OnInit {
  quote: string | undefined;
  isLoading = false;

  constructor(private gameService: GameService) {}

  ngAfterViewInit() {
    console.log('ngAfterViewInit');
    this.gameService.initConnection(this.connectionChanged);
  }

  ngOnInit() {
    this.isLoading = true;
  }

  connectionChanged(connected: boolean) {
    this.isLoading = connected;
    this.quote = `connected: ${connected}`;
  }
}
