import { EMemberStatusChange } from "./member-status-change.enum";
import { IParticipant } from "./participant";

// TODO NOW rename to IMemberChange
export interface IMemberStatusChange {
  memberStatusChange: EMemberStatusChange;
  member: IParticipant;
}