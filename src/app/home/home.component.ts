import { AfterViewInit, Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';

import { GameService } from '../@core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit, OnInit {

  // <editor-fold desc='Constructor & C°'>
  public constructor(private gameService: GameService) { }
  // </editor-fold>

  // <editor-fold desc='public methods'>

  // <editor-fold desc='Angular interface members'>
  public ngAfterViewInit() {
    if (this.gameService.canReconnect) {
      const tryReenter = confirm(`Do you want to rejoin the game '${this.gameService.team}' as '${this.gameService.myNick}'?`);
      if (tryReenter === true) {
        this.gameService.rejoin();
      }
      else {
        this.gameService.leave();
      }
    }
  }

  public ngOnInit() {}
  // </editor-fold>//

  // </editor-fold>
}
