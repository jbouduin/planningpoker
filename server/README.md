# Planning poker API Server

## Scripts in package.json

| Script               | Action                                              | Used in CI |
| -------------------- | --------------------------------------------------- | :--------: |
| **build:prod**       | build for production                                |            |
| **build:test**       | build for test                                      |            |
| **dev**              | nodemon server                                      |            |
| **test:ci**          | build:test and run all tests                        |     ✅     |
| **test:integration** | build:test and run integrations tests with coverage |            |
| **test:unit**        | build:test run unit tests with coverage             |            |

To run single tests:

- Running a single test file
  `npm run test:ci storage-team.test.js`
- Running a single test or suite
  `npm run test:ci storage-team.test.js -t some name`

Remark: filename, and test or suite name are _OR_-ed.
