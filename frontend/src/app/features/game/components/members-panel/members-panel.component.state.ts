import { Member } from '../../../../core';

export type LeaveButtonMode = 'leave' | 'disband';

export type MembersPanelState = {
  canLeave: boolean;
  canPause: boolean;
  developers: Array<Member>;
  leaveButtonMode: LeaveButtonMode;
  observers: Array<Member>;
  pauseButtonTooltip: string;
  scrumMaster: Member | null;
};
