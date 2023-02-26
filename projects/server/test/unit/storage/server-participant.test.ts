import { jest, expect, test, describe } from '@jest/globals';

import { IWebSocket, ReadyState } from '../../../src/services/websocket';
import { ServerParticipantRepository } from '../../../src/storage/implementation/server-participant.repository';
import { IServerParticipantRepository } from '../../../src/storage/interfaces/server-participant.repository';

const socket: IWebSocket = {
  readyState: ReadyState.OPEN,
  close: jest.fn(undefined),
  send: jest.fn(undefined)
};

test('create participant', () => {
  const repository: IServerParticipantRepository = new ServerParticipantRepository();
  const participant1 = repository.createParticipant(socket);
  expect(participant1.nick).toBe('participant 1');
  expect(participant1.participantId).not.toBeNull();
  expect(participant1.participantId.length).toBeGreaterThan(0);

  const participant2 = repository.createParticipant(socket);
  expect(participant2.nick).toBe('participant 2');
  expect(participant2.participantId).not.toBeNull();
  expect(participant2.participantId.length).toBeGreaterThan(0);

  expect(participant1.participantId).not.toBe(participant2.participantId);
});

test('CRUD', () => {
  const repository: IServerParticipantRepository = new ServerParticipantRepository();
  const participant1 = repository.createParticipant(socket);
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