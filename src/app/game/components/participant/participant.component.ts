import { Component, Input } from '@angular/core';

import { ParticipantStatus } from '@shared-lib';
import { Participant } from '../../objects/participant';

@Component({
  selector: 'game-participant',
  templateUrl: './participant.component.html',
  styleUrls: ['./participant.component.scss']
})
export class ParticipantComponent {

  //#region @Input() ----------------------------------------------------------
  @Input() public participant!: Participant;
  //#endregion

  //#region Public getter methods ---------------------------------------------
  public get connectionStatusIcon(): string {
    return this.participant?.status === ParticipantStatus.Connected ? 'cloud' : 'cloud_off';
  }

  public get nick(): string {
    return this.participant?.nick || '';
  }

  public get person(): string {
    return this.participant?.observer ? "person_outline" : "person";
  }
  //#endregion
}
