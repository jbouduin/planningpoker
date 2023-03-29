import { When } from '@wdio/cucumber-framework';
import { browser } from '@wdio/globals';

import startPage from '../pages/start.page.js';
import { EUser } from '../support/user.enum.js';

When(/^as (\w+) I create team (\w+) (.+)$/, async (user: EUser, teamName: string, observing: string) => {
  await startPage.createTeam(teamName, user, observing === 'observing');
});

When(/^as (\w+) I join team (\w+) (.+)$/, async (user: EUser, teamName: string, observing: string) => {
  await startPage.joinTeam(teamName, user, observing === 'observing');
});

When(/^as (\w+) I change my language to (.*)$/, async (user: EUser, language: string) => {
  await browser[user].$("<shell-language-selector />").$('<button />').click();
  const btn = await browser[user].$(`//*[@id="${language}"]`);
  await browser[user].waitUntil(() => btn.isClickable());
  btn.click();
});
