import { browser } from "@wdio/globals";
import { EUser } from "../support/user.enum";

class MemberListComponent {
  public async memberScrumMaster(user: EUser) {
    return browser[user].$("<session-member-panel />").$("//*[@id=\"scrum-master\"]").$("<session-member />");
  }

  public memberDevelopers(user: EUser) {
    return browser[user].$("<session-member-panel />").$("//*[@id=\"developers\"]").$$("<session-member />");
  }

  public memberObservers(user: EUser) {
    return browser[user].$("<session-member-panel />").$("//*[@id=\"observers\"]").$$("<session-member />");
  }
}

export default new MemberListComponent();
