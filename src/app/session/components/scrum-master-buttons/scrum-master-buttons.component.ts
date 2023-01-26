import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IGame } from '@app/session/objects';
import { TranslateService } from '@ngx-translate/core';
import { EGameStatus } from '@shared-lib';

@Component({
  selector: 'session-scrum-master-buttons',
  templateUrl: './scrum-master-buttons.component.html',
  styleUrls: ['./scrum-master-buttons.component.scss']
})
export class ScrumMasterButtonsComponent {

  @Input() public enabled: boolean;
  @Input() public game?: IGame;
  @Output() public startEstimating: EventEmitter<void>;
  @Output() public revealEstimations: EventEmitter<void>;

  //#region Private Properties ------------------------------------------------
  private translateService: TranslateService;
  //#endregion



  public get revealButtonLabel(): string {
    return this.translateService.instant('Game.Component.ButtonLabel.Reveal');
  }



  public get forceRevealButtonLabel(): string {
    return this.translateService.instant('Game.Component.ButtonLabel.ForceReveal');
  }

  public get startButtonLabel(): string {
    return this.translateService.instant('Game.Component.ButtonLabel.Start');
  }

  public get showDisconnect(): boolean {
    return  this.game ?  this.game.status !== EGameStatus.Disconnected : false;
    // !environment.production &&
  }

  public get showReveal(): boolean {
    return this.game ? this.game.showReveal : false;
  }

  public get showForceReveal(): boolean {
    return this.game ? this.game.showForceReveal : false;
  }

  public get showStart(): boolean {
    return this.game ? this.game.showStart : false;
  }

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    translateService: TranslateService) {
    this.translateService = translateService;
    this.enabled = false;
    this.revealEstimations = new EventEmitter<void>();
    this.startEstimating = new EventEmitter<void>();

  }
  //#endregion

  public clickReveal(): void {
    this.revealEstimations.emit();
  }

  public clickStart(): void {
    this.startEstimating.emit();
  }
}
