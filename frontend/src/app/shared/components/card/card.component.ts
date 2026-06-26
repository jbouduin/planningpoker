import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CardDto } from 'shared-lib';

@Component({
  selector: 'app-card',
  imports: [CommonModule, MatIconModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent {
  //#region Component Inputs --------------------------------------------------
  /** If undefined the card is a placeholder for someone who did not estimate */
  /**
   * If card is null, the logo is displayed
   */
  @Input() public card: CardDto | null;
  @Input() public enabled: boolean;
  @Input() public revealed: boolean;
  @Input() public mine: boolean;
  @Input() public isAvailableCard: boolean;
  @Output() public cardClicked: EventEmitter<number>;
  //#endregion

  //#region Getters-Setters ---------------------------------------------------
  public get label(): string {
    return this.card ? this.card.label : '';
  }

  public get isIcon(): boolean {
    return this.card ? this.card.isIcon : false;
  }

  public get showFaceUp(): boolean {
    return this.revealed || this.isAvailableCard;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    this.enabled = false;
    this.revealed = false;
    this.mine = false;
    this.isAvailableCard = false;
    this.card = null;
    this.cardClicked = new EventEmitter<number>();
  }
  //#endregion

  //#region UI-Triggers -------------------------------------------------------
  public click(): void {
    if (this.card) {
      this.cardClicked.emit(this.card.index);
    }
  }
  //#endregion
}
