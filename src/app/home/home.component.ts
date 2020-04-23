import { AfterViewInit, Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import { GameService } from '../@core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit, OnInit {

  // <editor-fold desc='Constructor & C°'>
  public constructor(private translateService: TranslateService, private gameService: GameService) { }
  // </editor-fold>

  // <editor-fold desc='Angular interface members'>
  public ngAfterViewInit() {
    if (this.gameService.canReconnect) {
      this.translateService
        .get(`Do you want to rejoin the game '${this.gameService.team}' as '${this.gameService.myNick}'?`)
        .subscribe( translated => {
          const tryReenter = confirm(translated);
          if (tryReenter === true) {
            this.gameService.rejoin();
          }
          else {
            this.gameService.leave();
          }
        });
    }
  }

  public ngOnInit() {}
  // </editor-fold>//

}
