import { Component, Input, OnInit } from '@angular/core';

import { ParticipantStatus } from '@shared-lib';
import { Participant } from '../../objects/participant';

@Component({
  selector: 'game-participant',
  templateUrl: './participant.component.html',
  styleUrls: ['./participant.component.scss']
})
export class ParticipantComponent implements OnInit {

  //#region  @Input()
  @Input() public participant!: Participant;
  //#endregion

  //#region  Public getter methods
  public get connectionStatusIcon(): string {
    return this.participant?.status === ParticipantStatus.Connected ? 'cloud' : 'cloud_off';
  }

  public get nick(): string {
    return this.participant?.nick || '';
  }
  //#endregion

  //#region  Constructor & C°
  public constructor() { }
  //#endregion

  //#region  Angular interface methods
  public ngOnInit(): void { }
  //#endregion


}
