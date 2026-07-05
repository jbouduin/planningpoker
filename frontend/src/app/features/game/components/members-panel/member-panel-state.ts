import { Member } from '../../../../core';

export type LeaveButtonMode = 'leave' | 'disband';

export interface MemberPanelState {
  developers: Array<Member>;
  observers: Array<Member>;
  scrumMaster: Member | null;
  leaveButtonMode: LeaveButtonMode;
}
