import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Card } from '../../objects';

@Component({
  selector: 'game-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {

  // <editor-fold desc='@Input() / @Output()'>
  @Input() public card!: Card;
  @Input() public enabled: boolean;
  @Input() public revealed: boolean;
  @Output() public cardClicked: EventEmitter<number>;
  // </editor-fold>

  // <editor-fold desc='public getter methods'>
  public get label(): string {
    return this.card ? this.card.label : ''
  }
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor() {
    this.enabled = false;
    this.revealed = false;
    this.cardClicked = new EventEmitter<number>()
  }
  // </editor-fold>

  // <editor-fold desc='Angular interface methods'>
  ngOnInit(): void { }
  // </editor-fold>

  // <editor-fold desc='UI Triggered methods'>
  public click(): void {
    this.cardClicked.emit(this.card.index);
  }
  // </editor-fold>
}
