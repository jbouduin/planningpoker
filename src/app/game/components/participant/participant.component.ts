import { Component, Input } from '@angular/core';

import { EParticipantStatus } from '@shared-lib';
import { Member } from '../../objects/member';

@Component({
  selector: 'game-participant',
  templateUrl: './participant.component.html',
  styleUrls: ['./participant.component.scss']
})
export class ParticipantComponent {

  //#region @Input() ----------------------------------------------------------
  @Input() public participant: Member | undefined;
  //#endregion

  //#region Public getter methods ---------------------------------------------
  public get connectionStatusIcon(): string {
    return this.participant?.status === EParticipantStatus.Connected ? 'cloud' : 'cloud_off';
  }

  public get nick(): string {
    return this.participant?.nick || '';
  }

  public get person(): string {
    return this.participant?.observer ? "person_outline" : "person";
  }
  //#endregion
}
