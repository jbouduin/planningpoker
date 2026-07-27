import { Given } from '@wdio/cucumber-framework';
import { EUser } from '../support/user.enum.js';
import startPage from '../pages/start.page.js';
import legalPage from '../pages/legal.page.js';


Given(/^as (\w+) I am on the start page$/, async (user: EUser) => {
  await legalPage.open(user);
  await legalPage.clearLocalStorage(user);
  await startPage.open(user);
});

Given(/^as (\w+) I returned to the start page$/, async (user: EUser) => {
  await startPage.open(user);
  await startPage.dumpLocalStorage(user);
});

Given(/^the (\w+) has created team (\w+) (.+)$/, async (user: EUser, teamName: string, observing: string) => {
  await legalPage.open(user);
  await legalPage.clearLocalStorage(user);
  await startPage.open(user);
  await startPage.createTeam(teamName, user, observing === 'observing');
});

Given(/^the (\w+) has joined team (\w+) (.+)$/, async (user: EUser, teamName: string, observing: string) => {
  await legalPage.open(user);
  await legalPage.clearLocalStorage(user);
  await startPage.open(user);
  await startPage.joinTeam(teamName, user, observing === 'observing');
});
