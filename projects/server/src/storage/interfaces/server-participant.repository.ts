import { IServerParticipant } from "../../objects";
import { IWebSocket } from "../../services/websocket";
import { IBaseRepository } from "./base.repository";

export interface IServerParticipantRepository extends IBaseRepository<IServerParticipant> {
  createParticipant(socket: IWebSocket): IServerParticipant;
}