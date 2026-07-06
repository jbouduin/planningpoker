# i18n-extract

A command-line tool for extracting i18n translation keys from source files.

## Features

- Extract translation keys from TypeScript, JavaScript and HTML files
- Supports glob patterns and path expansion
- Supports configuration via a configuration file
- Can extract keys from enum definitions
- Can merge or replace existing output files
- Can purge obsolete translation keys

---

## Installation

```bash
npm install
npm run build
```

---

## Usage

```bash
node dist/i18n-extract.js [options] [paths...]

Usage: i18n-extract [options] [paths...]

Arguments:
  paths                  Paths you would like to extract strings from. You can use path expansion, glob patterns and multiple paths
                         (default: "./**/*.{ts,js,html}")

Options:
  -V, --version          output the version number
  -p, --purge            Remove obsolete strings after merge (default: false)
  -r, --replace          Replace the contents of output file if it exists (default: false)
  -e, --enums <file>     a file containg enums for which to extract keys (default: [])
  -c, --config [config]  Configuration file
  -i, --ignore <ignore>  Ignore pattern. This parameter can be repeated (default: [])
  --enum-output [file]   The target output file for extracted enum keys. Required if -e is given.
  -o, --output <file>    Paths where you would like to save extracted strings. You can use path expansion, glob patterns and multiple paths
  -h, --help             display help for command
```

## Arguments

### `paths...`

Files or directories to scan.

Supports:

- Multiple paths
- Glob patterns
- Path expansion

If no path is provided, the following default pattern is used:

```text
./**/*.{ts,js,html}
```

Examples:

```bash
node dist/i18n-extract.js
```

```bash
node dist/i18n-extract.js src/**/*.ts
```

```bash
node dist/i18n-extract.js src shared-lib/src
```

---

## Options

### `-o --output <file>`

Target file where the extracted translation keys should be written.

Example:

```bash
node dist/i18n-extract.js -o translations.json src
```

---

### `-p, --purge`

Remove obsolete translation keys after merging.

Example:

```bash
node dist/i18n-extract.js --purge
```

---

### `-r, --replace`

Replace the contents of the output file instead of merging with existingg entries.

Example:

```bash
node dist/i18n-extract.js --replace
```

---

### `-e, --enums <file>`

Extract translation keys from enum definitions.

May be specified multiple times.

Example:

```bash
node dist/i18n-extract.js \
  -e status.enum.ts \
  -e role.enum.ts
```

---

### `--enum-output <file>`

Target output file for extracted enums.

Required whenever one or more --enums` options are specified.

Example:

```bash
node dist/i18n-extract.js \
  -e status.enum.ts \
  -e role.enum.ts \
  --enum-output ***ms.json
```

---

### `-i, --ignore <pattern>`

Ignore files matching the specified glob pattern.

May be specified multiple times.

Examples:

```bash
node dist/i18n-extract.js -i node_modules/**
```

```bash
node dist/i18n-extract.js \
  -i node_modules/** \
  -i dist/*****`
```

---

### `-c, --config [file]`

Load configuration from the specified file

Example:

```bash
node dist/i18n-extract.js -c i18n-config.json
```

If no file is specified, the tool may automatically discover a local `.i18n-extractrc` file.

---

### `-h, --help`

Display help iformation.

```bash
node dist/i18n-extract.js --help
```

---

### `-v, --version`

Display the application version.

```bash
node dist/i18n-extract.js --version
```

---

## Configuration File

Example `.i18n-extractrc`:

```json
{
  "output": "public/i18n/{en,de,fr}.json",
  "purge": false,
  "replace": false,
  "ignore": ["node_modules/**", "dist/**"],
  "enums": ["status.enum.ts", "role.enum.ts"],
  "enumOutput": "enums.json",
  "paths": ["src/**/*"]
}
```

## Precedence

When the same setting is specified in multiple places:

```text
Built-in defaults
    ↓
Configuration file
    ↓
Command-line arguments
```

Command-line arguments always take precedence over configuration values.

---

## Examples

### Extract all translation keys

```bash
node dist/i18n-extract.js \
  -o translations.json \
  src
```

### Ignore node_modules

```bash
node dist/i18n-extract.js \
  -o translations.json \
  -i node_modules/** \
  src
```

### Ignore multiple locations

```bash
node dist/i18n-extract.js \
  -o translations.json \
  -i node_modules/** \
  -i dist/** \
  src
```

### Extract enum keys

```bash
node dist/i18n-extract.js \
  -e status.enum.ts \
  -e role.enum.ts \
  --enum-output enums.json
```

### Replace existing output

```bash
node dist/i18n-extract.js \
  -o translations.json \
  --replace \
  src
```

### Purge obsolete keys

```bash
node dist/i18n-extract.js \
  -o translations.json \
  --purge \
  src
```

### Use a configuration file

```bash
node dist/i18n-extract.js \
  -c .i18n-extractrc
```

### Override configuration values from the CLI

```bash
node dist/i18n-extract.js \
  -c .i18n-extractrc \
  --replace \
  -o custom-translations.json
```
