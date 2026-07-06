export interface MemberComponentState {
  // Visibility of menu Items
  canChangeScrumMaster: boolean;
  canRemoveParticipant: boolean;
  canSwitchToObserver: boolean;
  canSwitchToNonObserver: boolean;
  // Enable disable menu items
  removeParticipantDisabled: boolean;
  changeScrumMasterDisabled: boolean;
  obServerSwitchDisabled: boolean;
}
