import { ECardSet, ICardSet, IEstimation } from "shared-lib";

import { IServerParticipant, ITeam } from "../../objects";
import { IWebSocket } from "../../services/websocket";


export interface IFactoryService {
  createCardSet(set: ECardSet): ICardSet;
  createEstimation(participantId: string, cardIndex: number | undefined): IEstimation;
  createParticipant(socket: IWebSocket): IServerParticipant;
  createTeam(teamName: string): ITeam;
}
