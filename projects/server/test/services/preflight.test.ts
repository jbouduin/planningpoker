import { Container } from 'inversify';

import SERVICETYPES from '../../src/services/service.types';
import STORAGETYPES from '../../src/storage/storage.types';

import { ECardSet, EClientMessageType, EErrorCode, ERole, IChangeCardSetMessage, IChangeNickMessage, IChangeScrumMasterMessage, ICreate, ICreatemessage, IEstimateMessage, IJoinMessage, ILeaveMessage, IObserveMessage, IObserverChange, IPauseMessage, IRejoinMessage, IRemoveMessage, IRevealMessage, IStartMessage } from '../../../shared-lib/lib';

import { CardService, PreflightService } from '../../src/services/implementation';
import { ICardService, IPreflightService } from '../../src/services/interfaces';
import { IWebSocket, ReadyState } from '../../src/services/websocket';
import { StorageService } from '../../src/storage/implementation';
import { IStorageService } from '../../src/storage/interfaces';

describe("preflight team message", () => {
  const container = new Container();
  container.bind<ICardService>(SERVICETYPES.CardService).to(CardService).inSingletonScope();
  container.bind<IPreflightService>(SERVICETYPES.PreflightService).to(PreflightService);
  container.bind<IStorageService>(STORAGETYPES.StorageService).to(StorageService).inSingletonScope();
  const preflighService = container.get<IPreflightService>(SERVICETYPES.PreflightService);
  const cardSet = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Cohn);
  const socket: IWebSocket = {
    readyState: ReadyState.OPEN,
    close: jest.fn().mockImplementation(() => { }),
    send: jest.fn().mockImplementation((_message: string) => { })
  }

  test('Create', () => {
    const teamName = 'Create';
    const storageService = container.get<IStorageService>(STORAGETYPES.StorageService);
    const data: ICreate = {
      team: teamName,
      observer: false,
      cardSet: ECardSet.Cohn,
      nick: ""
    };
    const sender = storageService.createParticipant(socket);
    sender.role = ERole.Developer;

    const message: ICreatemessage = { type: EClientMessageType.Create, senderUuid: '', data: data };
    // participant must exist
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotFound);
    message.senderUuid = sender.uuid;
    // all fine
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.NoError);
    // team should not exist
    storageService.createTeam(teamName, cardSet);
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.TeamAlreadyExists);
  });

  test('Join', () => {
    const teamName = 'Join';
    const storageService = container.get<IStorageService>(STORAGETYPES.StorageService);
    const data: ICreate = {
      team: teamName,
      observer: false,
      cardSet: ECardSet.Cohn,
      nick: ""
    };
    const sender = storageService.createParticipant(socket);
    sender.role = ERole.Developer;

    const message: IJoinMessage = { type: EClientMessageType.Join, senderUuid: '', data: data };
    // participant must exist
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotFound);
    message.senderUuid = sender.uuid;
    // team must exist
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.TeamDoesNotExist);
    const team = storageService.createTeam(teamName, cardSet);
    // all fine
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.NoError);
    // participant may not already be in the team
    storageService.joinTeam(team, sender);
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantAllReadyInTeam);
  });

  test('Leave - normal', () => {
    const teamName = 'leave-normal';
    const teamName2 = 'leave-normal2';
    const storageService = container.get<IStorageService>(STORAGETYPES.StorageService);
    const team = storageService.createTeam(teamName, cardSet);
    const sender = storageService.createParticipant(socket);
    sender.role = ERole.ScrumMaster;
    sender.observer = false;

    const message: ILeaveMessage = { type: EClientMessageType.Leave, senderUuid: '', data: sender.uuid };
    // sender must exist
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotFound);
    message.senderUuid = sender.uuid;
    // team must exist
    expect(preflighService.preflight(storageService, message, teamName2)).toBe(EErrorCode.TeamDoesNotExist);
    // sender must be in team
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotInTeam);
    storageService.joinTeam(team, sender);
    // all fine
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.NoError);
  });

  test('Leave - after disconnect', () => {
    const teamName = 'leave-after-disconnect';
    const teamName2 = 'leave-after-disconnect2';
    const storageService = container.get<IStorageService>(STORAGETYPES.StorageService);
    const team = storageService.createTeam(teamName, cardSet);
    const sender = storageService.createParticipant(socket);
    const leavingParticipant = storageService.createParticipant(socket);
    sender.role = ERole.ScrumMaster;
    sender.observer = false;
    const data: IObserverChange = {
      member: leavingParticipant.uuid,
      observer: true
    }

    const message: ILeaveMessage = { type: EClientMessageType.Leave, senderUuid: '', data: leavingParticipant.uuid };
    // sender must exist
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotFound);
    message.senderUuid = sender.uuid;
    // team must exist
    expect(preflighService.preflight(storageService, message, teamName2)).toBe(EErrorCode.TeamDoesNotExist);
    // sender must be in team
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotInTeam);
    storageService.joinTeam(team, sender);
    // other must be in the team
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotInTeam);
    storageService.joinTeam(team, leavingParticipant);
    // all fine
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.NoError);
    // other must exist
    message.data = '';
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotFound);
    message.data = leavingParticipant.uuid;
    // other may not be in another team
    storageService.leaveTeam(team, leavingParticipant);
    const team2 = storageService.createTeam(teamName2, cardSet);
    storageService.joinTeam(team2, leavingParticipant);
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotInTeam);
  });

  test('Pause', () => {
    const teamName = 'pause';
    const teamName2 = 'pause2';
    const storageService = container.get<IStorageService>(STORAGETYPES.StorageService);
    const team = storageService.createTeam(teamName, cardSet);
    const sender = storageService.createParticipant(socket);
    sender.role = ERole.ScrumMaster;
    sender.observer = false;

    const message: IPauseMessage = { type: EClientMessageType.Pause, senderUuid: '', data: undefined };
    // sender must exist
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotFound);
    message.senderUuid = sender.uuid;
    // team must exist
    expect(preflighService.preflight(storageService, message, teamName2)).toBe(EErrorCode.TeamDoesNotExist);
    // sender must be in team
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotInTeam);
    storageService.joinTeam(team, sender);
    // all fine
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.NoError);
  });

  test('Rejoin', () => {
    const teamName = 'rejoin';
    const teamName2 = 'rejoin2';
    const storageService = container.get<IStorageService>(STORAGETYPES.StorageService);
    const team = storageService.createTeam(teamName, cardSet);
    const sender = storageService.createParticipant(socket);
    sender.role = ERole.Developer;
    sender.observer = false;
    const rejoiningParticipant = storageService.createParticipant(socket);
    rejoiningParticipant.role = ERole.Developer;
    rejoiningParticipant.observer = false;

    const message: IRejoinMessage = { type: EClientMessageType.Rejoin, senderUuid: '', data: rejoiningParticipant.uuid };
    // sender must exist
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotFound);
    message.senderUuid = sender.uuid;
    // rejoining participant must exist
    message.data = '';
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotFound);
    message.data = rejoiningParticipant.uuid;
    // team must exist
    expect(preflighService.preflight(storageService, message, teamName2)).toBe(EErrorCode.TeamDoesNotExist);
    // the old participant must be in the team
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotInTeam);
    // sender may not be in the team
    storageService.joinTeam(team, sender);
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantAllReadyInTeam);
    // sender may not be in another team
    storageService.leaveTeam(team, sender);
    const team2 = storageService.createTeam(teamName2, cardSet);
    storageService.joinTeam(team2, sender);
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantAllReadyInTeam);
    // rejoining participant must be in the team
    storageService.leaveTeam(team2, sender);
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotInTeam);
    // old participant may not be in another team
    storageService.joinTeam(team2, rejoiningParticipant);
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotInTeam);
    // all fine
    storageService.leaveTeam(team2, rejoiningParticipant);
    storageService.joinTeam(team, rejoiningParticipant);
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.NoError);
    // storageService.joinTeam(participant.uuid, teamName);
  })
});

describe("preflight poker messages", () => {
  const container = new Container();
  container.bind<ICardService>(SERVICETYPES.CardService).to(CardService).inSingletonScope();
  container.bind<IPreflightService>(SERVICETYPES.PreflightService).to(PreflightService);
  container.bind<IStorageService>(STORAGETYPES.StorageService).to(StorageService).inSingletonScope();
  const preflighService = container.get<IPreflightService>(SERVICETYPES.PreflightService);
  const cardSet = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Cohn);
  const socket: IWebSocket = {
    readyState: 1,
    close: jest.fn().mockImplementation(() => { }),
    send: jest.fn().mockImplementation((_message: string) => { })
  }

  test('Start', () => {
    const teamName = "Start";
    const teamName2 = "Start2";
    const storageService = container.get<IStorageService>(STORAGETYPES.StorageService);
    const team = storageService.createTeam(teamName, cardSet);
    const sender = storageService.createParticipant(socket);
    sender.role = ERole.Developer;

    const message: IStartMessage = { type: EClientMessageType.Start, senderUuid: '', data: undefined };
    // sender must exist
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotFound);
    message.senderUuid = sender.uuid;
    // team must exist
    expect(preflighService.preflight(storageService, message, teamName2)).toBe(EErrorCode.TeamDoesNotExist);
    const team2 = storageService.createTeam(teamName2, cardSet);
    // sender must be in team
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotInTeam);
    storageService.joinTeam(team, sender);
    // sender must be scrum master
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ScrumMasterRequired);
    sender.role = ERole.ScrumMaster;
    // all fine
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.NoError);
    // sender may not be in a different team
    storageService.leaveTeam(team, sender);
    storageService.joinTeam(team2, sender);
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotInTeam);
  });

  test('Reveal', () => {
    const teamName = "Reveal";
    const teamName2 = "Reveal2";
    const storageService = container.get<IStorageService>(STORAGETYPES.StorageService);
    const team = storageService.createTeam(teamName, cardSet);
    const sender = storageService.createParticipant(socket);
    sender.role = ERole.Developer;

    const message: IRevealMessage = { type: EClientMessageType.Reveal, senderUuid: '', data: undefined };
    // sender must exist
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotFound);
    message.senderUuid = sender.uuid;
    // team must exist
    expect(preflighService.preflight(storageService, message, teamName2)).toBe(EErrorCode.TeamDoesNotExist);
    // sender must be in team
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotInTeam);
    storageService.joinTeam(team, sender);
    // sender must be scrum master
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ScrumMasterRequired);
    sender.role = ERole.ScrumMaster;
    // all fine
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.NoError);
    // sender may not be in a different team
    const team2 = storageService.createTeam(teamName2, cardSet);
    storageService.leaveTeam(team, sender);
    storageService.joinTeam(team2, sender);
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotInTeam);
  });

  test('Estimate', () => {
    const teamName = 'Estimate';
    const teamName2 = 'Estimate2';
    const storageService = container.get<IStorageService>(STORAGETYPES.StorageService);
    const team = storageService.createTeam(teamName, cardSet);
    const sender = storageService.createParticipant(socket);
    sender.role = ERole.Developer;
    sender.observer = true;

    const message: IEstimateMessage = { type: EClientMessageType.Estimate, senderUuid: '', data: 1 };
    // sender must exist
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotFound);
    message.senderUuid = sender.uuid;
    // sender must exist
    expect(preflighService.preflight(storageService, message, teamName2)).toBe(EErrorCode.TeamDoesNotExist);
    // sender must be in team
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotInTeam);
    storageService.joinTeam(team, sender);
    // sender may not be observer
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ObserverCanNotEstimate);
    sender.observer = false;
    // all fine
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.NoError);
    // sender may not be in a different team
    const team2 = storageService.createTeam(teamName2, cardSet);
    storageService.leaveTeam(team, sender);
    storageService.joinTeam(team2, sender);
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotInTeam);
  });

  test('Change card set', () => {
    const teamName = "change-card-set";
    const teamName2 = "change-card-set2";
    const storageService = container.get<IStorageService>(STORAGETYPES.StorageService);
    const team = storageService.createTeam(teamName, cardSet);
    const sender = storageService.createParticipant(socket);
    sender.role = ERole.Developer;

    const message: IChangeCardSetMessage = { type: EClientMessageType.ChangeCardSet, senderUuid: '', data: cardSet };
    // sender must exist
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotFound);
    message.senderUuid = sender.uuid;
    // sender must exist
    expect(preflighService.preflight(storageService, message, teamName2)).toBe(EErrorCode.TeamDoesNotExist);
    // sender must be in team
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotInTeam);
    storageService.joinTeam(team, sender);
    // sender must be scrum master
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ScrumMasterRequired);
    sender.role = ERole.ScrumMaster;
    // all fine
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.NoError);
    // sender may not be in a different team
    const team2 = storageService.createTeam(teamName2, cardSet);
    storageService.leaveTeam(team, sender);
    storageService.joinTeam(team2, sender);
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotInTeam);
  });
});

describe("preflight member messages", () => {
  const container = new Container();
  container.bind<ICardService>(SERVICETYPES.CardService).to(CardService).inSingletonScope();
  container.bind<IPreflightService>(SERVICETYPES.PreflightService).to(PreflightService);
  container.bind<IStorageService>(STORAGETYPES.StorageService).to(StorageService).inSingletonScope();
  const preflighService = container.get<IPreflightService>(SERVICETYPES.PreflightService);
  const cardSet = container.get<ICardService>(SERVICETYPES.CardService).getCardSet(ECardSet.Cohn);
  const socket: IWebSocket = {
    readyState: 1,
    close: jest.fn().mockImplementation(() => { }),
    send: jest.fn().mockImplementation((_message: string) => { })
  }

  test('Toggle Observe - self', () => {
    const teamName = 'observe-self';
    const teamName2 = 'observe-self2';
    const storageService = container.get<IStorageService>(STORAGETYPES.StorageService);
    const team = storageService.createTeam(teamName, cardSet);
    const sender = storageService.createParticipant(socket);
    sender.role = ERole.Developer;
    sender.observer = false;

    const data: IObserverChange = {
      member: sender.uuid,
      observer: true
    }
    const message: IObserveMessage = { type: EClientMessageType.Observe, senderUuid: '', data: data };
    // sender must exist
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotFound);
    message.senderUuid = sender.uuid;
    // team must exist
    expect(preflighService.preflight(storageService, message, teamName2)).toBe(EErrorCode.TeamDoesNotExist);
    // sender must be in team
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotInTeam);
    storageService.joinTeam(team, sender);
    // all fine
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.NoError);
  });

  test('Toggle Observe - other', () => {
    const teamName = 'observe-other';
    const teamName2 = 'observe-other2';
    const storageService = container.get<IStorageService>(STORAGETYPES.StorageService);
    const team = storageService.createTeam(teamName, cardSet);
    const sender = storageService.createParticipant(socket);
    const toggledParticipant = storageService.createParticipant(socket);
    sender.role = ERole.ScrumMaster;
    sender.observer = false;

    const data: IObserverChange = {
      member: toggledParticipant.uuid,
      observer: true
    }
    const message: IObserveMessage = { type: EClientMessageType.Observe, senderUuid: '', data: data };
    // sender must exist
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotFound);
    message.senderUuid = sender.uuid;
    // team must exist
    expect(preflighService.preflight(storageService, message, teamName2)).toBe(EErrorCode.TeamDoesNotExist);
    // sender must be in team
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotInTeam);
    storageService.joinTeam(team, sender);
    // other must be in the team
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotInTeam);
    storageService.joinTeam(team, toggledParticipant);
    // all fine
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.NoError);
    // sender must be scrum master
    sender.role = ERole.Developer;
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ScrumMasterRequired);
    sender.role = ERole.ScrumMaster;
    // other must exist
    message.data.member = '';
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotFound);
    message.data.member = toggledParticipant.uuid;
    // other may not be in another team
    const team2 = storageService.createTeam(teamName2, cardSet);
    storageService.leaveTeam(team, toggledParticipant);
    storageService.joinTeam(team2, toggledParticipant);
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotInTeam);
  });

  test('Change nick', () => {
    const teamName = 'Change nick';
    const storageService = container.get<IStorageService>(STORAGETYPES.StorageService);
    const sender = storageService.createParticipant(socket);
    sender.role = ERole.Developer;
    sender.observer = false;

    const message: IChangeNickMessage = { type: EClientMessageType.ChangeNick, senderUuid: '', data: '' };
    // sender must exist
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotFound);
    message.senderUuid = sender.uuid;
    // all fine
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.NoError);
  });

  test('Change Scrum Master', () => {
    const teamName = 'change-scrum-master';
    const teamName2 = 'change-scrum-master2';
    const storageService = container.get<IStorageService>(STORAGETYPES.StorageService);
    const team = storageService.createTeam(teamName, cardSet);
    const sender = storageService.createParticipant(socket);
    const newScrumMaster = storageService.createParticipant(socket);
    sender.role = ERole.ScrumMaster;
    sender.observer = false;

    const data: IObserverChange = {
      member: newScrumMaster.uuid,
      observer: true
    }
    const message: IChangeScrumMasterMessage = { type: EClientMessageType.ChangeScrumMaster, senderUuid: '', data: newScrumMaster.uuid };
    // sender must exist
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotFound);
    message.senderUuid = sender.uuid;
    // team must exist
    expect(preflighService.preflight(storageService, message, teamName2)).toBe(EErrorCode.TeamDoesNotExist);
    // sender must be in team
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotInTeam);
    storageService.joinTeam(team, sender);
    // other must be in the team
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotInTeam);
    storageService.joinTeam(team, newScrumMaster);
    // all fine
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.NoError);
    // only scrum master can do this
    sender.role = ERole.Developer;
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ScrumMasterRequired);
    sender.role = ERole.ScrumMaster;
    // other must exist
    message.data = '';
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotFound);
    message.data = newScrumMaster.uuid;
    // other may not be in another team
    const team2 = storageService.createTeam(teamName2, cardSet);
    storageService.leaveTeam(team, newScrumMaster);
    storageService.joinTeam(team2, newScrumMaster);
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotInTeam);
  });

  test('Remove', () => {
    const teamName = 'remove';
    const teamName2 = 'remove2';
    const storageService = container.get<IStorageService>(STORAGETYPES.StorageService);
    const team = storageService.createTeam(teamName, cardSet);
    const sender = storageService.createParticipant(socket);
    const removedParticipant = storageService.createParticipant(socket);
    sender.role = ERole.ScrumMaster;
    sender.observer = false;

    const data: IObserverChange = {
      member: removedParticipant.uuid,
      observer: true
    }
    const message: IRemoveMessage = { type: EClientMessageType.Remove, senderUuid: '', data: removedParticipant.uuid };
    // sender must exist
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotFound);
    message.senderUuid = sender.uuid;
    // team must exist
    expect(preflighService.preflight(storageService, message, teamName2)).toBe(EErrorCode.TeamDoesNotExist);
    // sender must be in team
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotInTeam);
    storageService.joinTeam(team, sender);
    // other must be in the team
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotInTeam);
    storageService.joinTeam(team, removedParticipant);
    // all fine
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.NoError);
    // only scrum master can do this
    sender.role = ERole.Developer;
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ScrumMasterRequired);
    sender.role = ERole.ScrumMaster;
    // other must exist
    message.data = '';
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotFound);
    message.data = removedParticipant.uuid;
    // other may not be in another team
    const team2 = storageService.createTeam(teamName2, cardSet);
    storageService.leaveTeam(team, removedParticipant);
    storageService.joinTeam(team2, removedParticipant);
    expect(preflighService.preflight(storageService, message, teamName)).toBe(EErrorCode.ParticipantNotInTeam);
  });
});