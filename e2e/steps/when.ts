import { When } from '@wdio/cucumber-framework';
import { browser } from '@wdio/globals';

import startPage from '../pages/start.page.js';
import { EUser } from '../support/user.enum.js';

When(/^I create team (\w+) as (.+)$/, async (teamName: string, user: EUser) => {
  await startPage.createTeam(teamName, user);
});

When(/^I join team (\w+) as (.+)$/, async (teamName: string, user: EUser) => {
  await startPage.joinTeam(teamName, user);
});

When(/^as (\w+) I change my language to (.*)$/, async (user: EUser, language: string) => {
  await browser[user].$("<shell-language-selector />").$('<button />').click();
  const btn = await browser[user].$(`//*[@id="${language}"]`);
  await browser[user].waitUntil(() => btn.isClickable());
  btn.click();
});
