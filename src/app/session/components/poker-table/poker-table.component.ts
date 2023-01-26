import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Estimation, Member, PokerRound } from '../../../session/objects';
import { TranslateService } from '@ngx-translate/core';
import { outputAst } from '@angular/compiler';

@Component({
  selector: 'session-poker-table',
  templateUrl: './poker-table.component.html',
  styleUrls: ['./poker-table.component.scss']
})
export class PokerTableComponent {

  @Input() public pokerRound?: PokerRound;
  @Input() public canEstimate: boolean;
  @Output() public withdraw: EventEmitter<void>;

  //#region Private Properties ------------------------------------------------
  private translateService: TranslateService;
  //#endregion

  public get estimations(): Array<Estimation> {
    return this.pokerRound?.estimations || new Array<Estimation>();
  }

  public get participantsWithoutEstimation(): Array<Member> {
    return this.pokerRound?.participantsWithoutEstimation || new Array<Member>
  }

  public get meLabel(): string {
    return this.translateService.instant('Game.Card.Me_label');
  }

  //#region Constructor & C° --------------------------------------------------
  public constructor(
    translateService: TranslateService) {
    this.translateService = translateService;
    this.canEstimate = false;
    this.withdraw = new EventEmitter<void>;
  }
  //#endregion

  public cardClicked(): void {
    this.withdraw.emit();
  }
}
