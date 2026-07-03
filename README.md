# planningpoker

This project was originally generated with [ngX-Rocket](https://github.com/ngx-rocket/generator-ngx-rocket/) version 8.0.1

It is a playground to play with

- expresjs
- websockets
- angular
- winston
- multi-language (@ngx-translate)
- di (inversify)
- testing frameworks
  - vitest
  - jest
  - cucumber (wdio)

## Getting started

### Install dependencies

  ```sh
  npm ci
  cd frontend
  npm ci
  cd ../server
  npm ci
  cd ../shared-lib
  npm ci
  ```

### Build shared-lib

  ```sh
  cd shared-lib
  npm run build
  ```

### Run prebuild for fronted

  ```sh
  cd frontend
  npm run prebuild
  ```

### Start Site

  ```sh
  npm run start:site
  ```

### Start Server

  ```sh
  npm run start:server
  ```

## Scripts in package.json

### Run

| Script           | Action                         |
| ---------------- | -------------------------------|
| **start:server** | runs api server with nodemon   |
| **start:site**   | runs the ng server on the site |

### Prettier

| Script                | Action                        | Used in CI |
| --------------------- | ----------------------------- | :--------: |
| **format**            | run full prettier check       |            |
| **format:write**      | run full prettier and fix     |            |
| **format:frontend**   | run prettier check on fronted | ✅         |
| **format:server**     | run prettier check on server  | ✅         |
| **format:shared-lib** | run prettier on shared-lib    | ✅         |
| **format:tools**      | run prettier check tools      | ✅         |

### Lint

| Script              | Action              | Used in CI |
| ------------------- | ------------------- | :--------: |
| **lint**            | eslint full project |            |
| **lint:frontend**   | eslint fronted      | ✅         |
| **lint:server**     | eslint server       | ✅         |
| **lint:shared-lib** | eslint shared-lib   | ✅         |
| **lint:tools**      | eslint tools        | ✅         |

For more details on ESLint setup see ...
