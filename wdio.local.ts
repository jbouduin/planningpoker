import { config as sharedConfig } from './wdio.shared.conf.js'

// ts-expect-error
export const config: WebdriverIO.Config  = {
  ...sharedConfig,
  ...{
    // services: ['selenium-standalone'],
    services: [],
    capabilities: {
      scrumMaster: {
        capabilities: {
          browserName: 'chrome',
          'goog:chromeOptions': {
            args: ['--incognito']
          }
        }
      },
      // developerA: {
      //   capabilities: {
      //     browserName: 'chrome',
      //     'goog:chromeOptions': {
      //       args: ['--incognito']
      //     }
      //   }
      // },
      // developerB: {
      //   capabilities: {
      //     browserName: 'chrome',
      //     'goog:chromeOptions': {
      //       args: ['--incognito']
      //     }
      //   }
      // },
      observer: {
        capabilities: {
          browserName: 'chrome',
          'goog:chromeOptions': {
            args: ['--incognito']
          }
        }
      }
    }
    //     'wdio:devtoolsOptions': {
    //   headless: false
    // },
      // {
      //   browserName: 'firefox',
      //     "moz:firefoxOptions": {
      //       // flag to activate Firefox headless mode (see https://github.com/mozilla/geckodriver/blob/master/README.md#firefox-capabilities for more details about moz:firefoxOptions)
      //       //args: ['-headless']
      //   }
      // },

  }
};
