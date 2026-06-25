import { CanRejoinDto, CardSetDto } from 'shared-lib';

export interface IApiController {
  availableCardSets(): Array<CardSetDto>;
  canRejoin(teamName: string, participantId: string): CanRejoinDto;
}
