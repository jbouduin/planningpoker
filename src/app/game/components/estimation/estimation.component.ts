import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Card, Estimation } from '../../objects';

@Component({
  selector: 'game-estimation',
  templateUrl: './estimation.component.html',
  styleUrls: ['./estimation.component.scss']
})
export class EstimationComponent implements OnInit {

  // <editor-fold desc='@Input() / @Output()'>
  @Input() public estimation!: Estimation;
  @Input() public enabled!: boolean;
  @Output() public estimationClicked: EventEmitter<number>;
  // </editor-fold>

  // <editor-fold desc='Public getter methods'>
  public get card(): Card {
    return this.estimation.card;
  }

  public get nick(): string {
    return this.estimation.participant.nick;
  }

  public get revealed(): boolean {
    return this.estimation.revealed;
  }
  // </editor-fold>

  // <editor-fold desc='Public constructor & C°'>
  constructor() {
    this.enabled = false;
    this.estimationClicked = new EventEmitter<number>();
  }
  // </editor-fold>

  // <editor-fold desc='Angular interface methods'>
  public ngOnInit(): void { }
  // </editor-fold>

  // <editor-fold desc='UI triggered methods'>
  public withdraw(): void {
    this.estimationClicked.emit(0);
  }
  // </editor-fold>
}
