import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Card, Estimation } from '../../objects';

@Component({
  selector: 'game-estimation',
  templateUrl: './estimation.component.html',
  styleUrls: ['./estimation.component.scss']
})
export class EstimationComponent {

  //#region  @Input() / @Output()
  @Input() public estimation!: Estimation;
  @Input() public enabled!: boolean;
  @Output() public estimationClicked: EventEmitter<number>;
  //#endregion

  //#region  Public getter methods
  public get card(): Card {
    return this.estimation.card;
  }

  public get nick(): string {
    return this.estimation.participant.nick;
  }

  public get revealed(): boolean {
    return this.estimation.revealed;
  }
  //#endregion

  //#region  Public constructor & C°
  constructor() {
    this.enabled = false;
    this.estimationClicked = new EventEmitter<number>();
  }
  //#endregion

  //#region  Angular interface methods
  // public ngOnInit(): void { }
  //#endregion

  //#region  UI triggered methods
  public withdraw(): void {
    this.estimationClicked.emit(0);
  }
  //#endregion
}
