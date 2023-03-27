import { expect } from '@wdio/globals';
import { Then } from '@wdio/cucumber-framework';

import LoginPage from '../pages/login.page.js';
import SecurePage from '../pages/secure.page.js';

// const pages = {
//   login: LoginPage
// }

Then(/^I should see a flash message saying (.*)$/, async (message) => {
  await expect(SecurePage.flashAlert).toBeExisting();
  await expect(SecurePage.flashAlert).toHaveTextContaining(message);
});
