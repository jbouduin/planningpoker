import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Card } from './card';

@Component({
  selector: 'shared-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent {

  //#region @Input() / @Output() ----------------------------------------------
  /** If undefined the card is a placeholder for someone who did not estimate */
  @Input() public card: Card | undefined;
  @Input() public enabled: boolean;
  @Input() public revealed: boolean;
  @Input() public mine: boolean;
  @Input() public isAvailableCard: boolean;
  @Output() public cardClicked: EventEmitter<number>;
  //#endregion

  //#region public getter methods ---------------------------------------------
  public get label(): string {
    return this.card ? this.card.label : '';
  }

  public get showFaceUp(): boolean {
    return this.revealed || this.isAvailableCard;
  }

  public get isIcon(): boolean {
    return this.card ? this.card.isIcon : false;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    this.enabled = false;
    this.revealed = false;
    this.mine = false;
    this.isAvailableCard = false;
    this.cardClicked = new EventEmitter<number>()
  }
  //#endregion

  //#region UI Triggered methods ----------------------------------------------
  public click(): void {
    if (this.card) {
      this.cardClicked.emit(this.card.index);
    }
  }
  //#endregion
}
