import { Component, OnInit } from '@angular/core';

//import { GameService } from '../../game';

import { ConnectingStatus } from './connecting-status';

@Component({
  selector: 'app-connecting',
  templateUrl: './connecting.component.html',
  styleUrls: ['./connecting.component.scss']
})
export class ConnectingComponent implements OnInit {

  // <editor-fold desc='Constructor & C°'>
  constructor() {}
  //private gameService: GameService) { }
  // </editor-fold>

  // <editor-fold desc='Public getter methods'>
  public get hideTryNow(): boolean {
    return false;
  }

  public get isVisible(): boolean {
    return true; //this.gameService.connectingStatus !== ConnectingStatus.Finished;
  }

  public get message(): string {
    return 'message on the connector';
  }
  // </editor-fold>

  // <editor-fold desc='Public Angular interface methods'>
  ngOnInit(): void {
  }
  // </editor-fold>

  // <editor-fold desc='Public UI-trigger methods'>
  public cancel(): void {

  }

  public tryNow(): void {

  }
  // </editor-fold>
}
