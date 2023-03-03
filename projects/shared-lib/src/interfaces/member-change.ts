import { EMemberChangeType } from "./member-change-type.enum";
import { IParticipant } from "./participant";

export interface IMemberChange {
  memberStatusChange: EMemberChangeType;
  member: IParticipant;
}