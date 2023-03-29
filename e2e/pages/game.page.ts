import { browser } from "@wdio/globals";

import { EUser } from "../support/user.enum.js";
import Page from './page.js';

class GamePage extends Page {

  public teamHeader(user: EUser): string {
    return browser[user].$("<session-team-header />");
  }

  public changeCardSetButton(user: EUser) {
    return browser[user].$("//*[@id=\"change-card-set-button\"]");
  }

  public startButton(user: EUser) {
    return browser[user].$("//*[@id=\"start-button\"]");
  }

  public leaveButton(user: EUser) {
    return browser[user].$("//*[@id=\"leave-button\"]");
  }

  public pauseButton(user: EUser) {
    return browser[user].$("//*[@id=\"pause-button\"]");
  }

  public snackbarMessage(user: EUser) {
    return browser[user].$("//*[@id=\"snackbar-message\"]");
  }

  public async dismissTeam(): Promise<void> {
    browser[EUser.scrumMaster].waitUntil(() => this.leaveButton(EUser.scrumMaster).isClickable());
    await this.leaveButton(EUser.scrumMaster).click();
    const yes = await browser[EUser.scrumMaster].$("//*[@id=\"yes-button\"]");
    browser[EUser.scrumMaster].waitUntil(() => yes.isClickable());
    yes.click();
  }
}

export default new GamePage();
