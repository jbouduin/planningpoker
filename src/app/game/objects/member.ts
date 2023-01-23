import { IParticipant, EParticipantStatus, ERole } from '@shared-lib';

export class Member {

  //#region Public properties -------------------------------------------------
  public status: EParticipantStatus;
  public nick: string;
  public uuid: string;
  public role: ERole;
  public me: boolean;
  public observer: boolean;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(dtoParticipant: IParticipant, me: boolean) {
    this.status = dtoParticipant.status;
    this.nick = dtoParticipant.nick;
    this.uuid = dtoParticipant.uuid;
    this.role = dtoParticipant.role;
    this.observer = dtoParticipant.observer;
    this.me = me;
  }
  //#endregion
}
