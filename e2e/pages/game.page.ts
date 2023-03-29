import { browser } from "@wdio/globals";

import { EUser } from "../support/user.enum.js";
import Page from './page.js';

class GamePage extends Page {

  //#region Team header -------------------------------------------------------
  public teamHeader(user: EUser): string {
    return browser[user].$("<session-team-header />");
  }
  //#endregion

  //#region Member and Scrum Master buttons -----------------------------------
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
  //#endregion

  //#region Member panel ------------------------------------------------------
  public memberScrumMaster(user: EUser) {
    return browser[user].$("<session-member-panel />").$("/div/div[0]").$("<session-member />");
  }

  public memberDevelopers(user: EUser) {
    return browser[user].$("<session-member-panel />").$("/div/div[1]").$$("<session-member />");
  }

  public memberObservers(user: EUser) {
    return browser[user].$("<session-member-panel />").$("/div/div[2]").$$("<session-member />");
  }
  //#endregion


  //#region scrum master actions ----------------------------------------------
  public async dismissTeam(): Promise<void> {
    browser[EUser.scrumMaster].waitUntil(() => this.leaveButton(EUser.scrumMaster).isClickable());
    await this.leaveButton(EUser.scrumMaster).click();
    const yes = await browser[EUser.scrumMaster].$("//*[@id=\"yes-button\"]");
    browser[EUser.scrumMaster].waitUntil(() => yes.isClickable());
    yes.click();
  }
  //#endregion
}

export default new GamePage();
