import { Component, Input, OnInit } from '@angular/core';

import { ParticipantStatus } from '@shared-lib';
import { Participant } from '../../objects/participant';

@Component({
  selector: 'game-participant',
  templateUrl: './participant.component.html',
  styleUrls: ['./participant.component.scss']
})
export class ParticipantComponent implements OnInit {

  // <editor-fold desc='@Input()'>
  @Input() public participant!: Participant;
  // </editor-fold>

  // <editor-fold desc='Public getter methods'>
  public get connectionStatusIcon(): string {
    return this.participant?.status === ParticipantStatus.Connected ? 'cloud' : 'cloud_off';
  }

  public get nick(): string {
    return this.participant?.nick || '';
  }
  // </editor-fold>

  // <editor-fold desc='Constructor & C°'>
  public constructor() { }
  // </editor-fold>

  // <editor-fold desc='Angular interface methods'>
  public ngOnInit(): void { }
  // </editor-fold>


}
