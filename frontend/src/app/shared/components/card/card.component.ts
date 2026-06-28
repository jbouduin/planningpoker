import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { IDisplayCard } from './display-card';

@Component({
  selector: 'app-card',
  imports: [CommonModule, MatIconModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent {
  //#region Component Inputs --------------------------------------------------
  @Input({ required: true }) public displayCard!: IDisplayCard;
  @Output() public cardClicked: EventEmitter<number>;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    this.cardClicked = new EventEmitter<number>();
  }
  //#endregion

  //#region UI-Triggers -------------------------------------------------------
  public click(): void {
    if (this.displayCard.card) {
      this.cardClicked.emit(this.displayCard.card.index);
    }
  }
  //#endregion
}
