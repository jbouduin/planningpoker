import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Card } from '../../objects';

@Component({
  selector: 'game-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent {

  //#region  @Input() / @Output()
  @Input() public card!: Card;
  @Input() public enabled: boolean;
  @Input() public revealed: boolean;
  @Output() public cardClicked: EventEmitter<number>;
  //#endregion

  //#region  public getter methods
  public get label(): string {
    return this.card ? this.card.label : ''
  }
  //#endregion

  //#region  Constructor & C°
  public constructor() {
    this.enabled = false;
    this.revealed = false;
    this.cardClicked = new EventEmitter<number>()
  }
  //#endregion

  //#region  Angular interface methods
  // ngOnInit(): void { }
  //#endregion

  //#region  UI Triggered methods
  public click(): void {
    this.cardClicked.emit(this.card.index);
  }
  //#endregion
}
