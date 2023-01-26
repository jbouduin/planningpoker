import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Card } from '@app/session/objects';


@Component({
  selector: 'session-my-hand',
  templateUrl: './my-hand.component.html',
  styleUrls: ['./my-hand.component.scss']
})
export class MyHandComponent {
  @Input() public availableCards: Array<Card>;
  @Input() public canEstimate: boolean;
  @Output() public estimate: EventEmitter<number>;

  public constructor() {
    this.availableCards = new Array<Card>();
    this.canEstimate = false;
    this.estimate = new EventEmitter<number>();
  }

  public cardClicked(index: number) {
    this.estimate.emit(index);
  }
}
