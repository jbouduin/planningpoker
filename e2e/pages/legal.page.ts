// import { browser } from "@wdio/globals";
import { EUser } from "../support/user.enum.js";
import Page from './page.js';

class LegalPage extends Page {

  public open(user: EUser) {
    return super.open(user, 'legal');
  }
}
export default new LegalPage();
