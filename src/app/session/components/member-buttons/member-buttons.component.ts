import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IGame } from '@app/session/objects';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'session-member-buttons',
  templateUrl: './member-buttons.component.html',
  styleUrls: ['./member-buttons.component.sass']
})
export class MemberButtonsComponent {
  @Input() public game?: IGame;
  @Input() public enabled: boolean;
  @Output() public leave: EventEmitter<void>;
  @Output() public disconnect: EventEmitter<void>;

  //#region Private Properties ------------------------------------------------
  private translateService: TranslateService;
  //#endregion

  public get leaveLabel(): string {
    return this.game?.scrumMaster.me ?
      this.translateService.instant('Game.Component.ButtonLabel.End_session') :
      this.translateService.instant('Game.Component.ButtonLabel.Leave_game');
  }

  public get pauseButtonLabel(): string {
    return this.translateService.instant('Game.Component.ButtonLabel.Pause');
  }

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    translateService: TranslateService) {
    this.translateService = translateService;
    this.enabled = false;
    this.leave = new EventEmitter<void>();
    this.disconnect = new EventEmitter<void>();
  }
  //#endregion

  public clickDisconnect(): void{
    this.disconnect.emit();
  }
  public clickLeave(): void {
    this.leave.emit();
  }
}
