import { LooseObject } from "../../objects";

export interface IApiController {
  canRejoin(teamName: string, uuid: string): LooseObject;
}