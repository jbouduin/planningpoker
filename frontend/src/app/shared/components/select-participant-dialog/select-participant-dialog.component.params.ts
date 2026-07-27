import { ParticipantDto } from 'shared-lib';
import { extract } from '../../../core';

export class SelectParticipantDialogComponentParams {
  //#region Public properties -------------------------------------------------
  public titleKey: string;
  public participantLabelKey: string;
  public participants: Array<ParticipantDto>;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    this.titleKey = extract('SelectParticipantDialog.Default.Title');
    this.participantLabelKey = extract('SelectParticipantDialog.Default.Participant.Label');
    this.participants = new Array<ParticipantDto>();
  }
  //#endregion
}
