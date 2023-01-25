import { Estimation } from "./estimation";
import { Member } from "./member";

export class PokerRound {
  public estimations: Array<Estimation>;
  public participantsWithoutEstimation: Array<Member>;


  public constructor() {
    this.estimations = new Array<Estimation>();
    this.participantsWithoutEstimation = new Array<Member>();
  }

}