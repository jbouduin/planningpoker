import { describe, expect, jest, test } from '@jest/globals';

import { IWebSocket, ReadyState } from '../../../src/services/websocket';
import { FactoryService } from '../../../src/storage/implementation/factory.service';
import { ServerParticipantRepository } from '../../../src/storage/implementation/server-participant.repository';
import { IFactoryService } from '../../../src/storage/interfaces/factory.service';
import { IServerParticipantRepository } from '../../../src/storage/interfaces/server-participant.repository';

// TODO NOW use util
const socket: IWebSocket = {
  readyState: ReadyState.OPEN,
  close: jest.fn(undefined),
  send: jest.fn(undefined)
};

describe('IServerParticipantRepository', () => {
  test('create participant', () => {
    const factory: IFactoryService = new FactoryService();
    const participant1 = factory.createParticipant(socket);
    expect(participant1.nick).toBe('participant 1');
    expect(participant1.participantId).not.toBeNull();
    expect(participant1.participantId.length).toBeGreaterThan(0);

    const participant2 = factory.createParticipant(socket);
    expect(participant2.nick).toBe('participant 2');
    expect(participant2.participantId).not.toBeNull();
    expect(participant2.participantId.length).toBeGreaterThan(0);

    expect(participant1.participantId).not.toBe(participant2.participantId);
  });
});

test('BaseRepository CR-D', () => {
  const factory: IFactoryService = new FactoryService();
  const participant1 = factory.createParticipant(socket);
  const repository: IServerParticipantRepository = new ServerParticipantRepository();
  repository.add(participant1);
  const participant1Id = participant1.participantId;
  repository.add(participant1);
  expect(repository.get(participant1Id)).toBeDefined();
  expect(repository.getAll().length).toBe(1);
  expect(repository.exists(participant1Id)).toBe(true);
  repository.remove(participant1Id);
  expect(repository.get(participant1Id)).toBeUndefined();
  expect(repository.getAll().length).toBe(0);
  expect(repository.exists(participant1Id)).toBe(false);
})