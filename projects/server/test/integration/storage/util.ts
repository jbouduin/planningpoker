import { jest } from '@jest/globals';
import { Container } from "inversify";

import SERVICETYPES from '../../../src/services/service.types';
import STORAGETYPES from '../../../src/storage/storage.types';

import { CardService } from '../../../src/services/implementation';
import { ICardService } from '../../../src/services/interfaces';
import { IWebSocket, ReadyState } from "../../../src/services/websocket";
import { CardSetRepository, EstimationRepository, MembershipRepository, ServerParticipantRepository, StorageService, TeamRepository } from "../../../src/storage/implementation";
import { ICardSetRepository, IEstimationRepository, IMembershipRepository, IServerParticipantRepository, IStorageService, ITeamRepository } from "../../../src/storage/interfaces";

export class Util {
  public static participant1Nick = 'participant 1';
  public static team1Name = 'team1';
  public static team2Name = 'team2';

  public static getContainer(): Container {
    const container = new Container();
    container.bind<ICardService>(SERVICETYPES.CardService).to(CardService).inSingletonScope();
    container.bind<ICardSetRepository>(STORAGETYPES.CardSetRepository).to(CardSetRepository).inSingletonScope();
    container.bind<IEstimationRepository>(STORAGETYPES.EstimationRepository).to(EstimationRepository).inSingletonScope();
    container.bind<IMembershipRepository>(STORAGETYPES.MembershipRepository).to(MembershipRepository).inSingletonScope();
    container.bind<IServerParticipantRepository>(STORAGETYPES.ServerParticipantRepository).to(ServerParticipantRepository).inSingletonScope();
    container.bind<IStorageService>(STORAGETYPES.StorageService).to(StorageService).inSingletonScope();
    container.bind<ITeamRepository>(STORAGETYPES.TeamRepository).to(TeamRepository).inSingletonScope();
    return container;
  }

  public static getSocket(): IWebSocket {
    return {
      readyState: ReadyState.OPEN,
      close: jest.fn(undefined),
      send: jest.fn(undefined)
    }
  }

  public static sleep(milliSeconds: number): Promise<unknown> {
    return new Promise(r => setTimeout(r, milliSeconds));

  }
}