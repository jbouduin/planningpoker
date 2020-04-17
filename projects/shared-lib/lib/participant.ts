import { Role } from './role';

export class Participant {
  public nick: string;
  public uuid: string;
  public role: Role;
  public socket: any;
}
