import { Member } from "./member";

export class Team {

  public developers: Array<Member>;
  public observers: Array<Member>;
  public scrumMaster: Member;
  public teamName: string;

  public constructor(teamName: string, scrumMaster: Member) {
    this.developers = new Array<Member>();
    this.observers = new Array<Member>();
    this.scrumMaster = scrumMaster;
    this.teamName = teamName;
  }
}