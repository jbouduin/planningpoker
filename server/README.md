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
