import { EMemberStatusChange } from "./member-status-change.enum";
import { IParticipant } from "./participant";

export interface IMemberStatusChange {
  memberStatusChange: EMemberStatusChange;
  member: IParticipant;
}