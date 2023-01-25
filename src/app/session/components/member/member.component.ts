import { Component, Input } from '@angular/core';
import { EParticipantStatus } from '@shared-lib';
import { Member } from '../../objects/member';

@Component({
  selector: 'game-member',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.scss']
})
export class MemberComponent {

  //#region @Input() ----------------------------------------------------------
  @Input() public member: Member | undefined;
  //#endregion

  //#region Public getter methods ---------------------------------------------
  public get connectionStatusIcon(): string {
    return this.member?.status === EParticipantStatus.Connected ? 'cloud' : 'cloud_off';
  }

  public get nick(): string {
    return this.member?.nick || '';
  }

  public get person(): string {
    return this.member?.observer ? "person_outline" : "person";
  }
  //#endregion
}
