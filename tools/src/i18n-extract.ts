import { Project } from 'ts-morph';
import { Command } from 'commander';
import fs, { existsSync, mkdirSync } from 'fs';
import * as glob from 'glob';
import path from 'path';

// TODO move enum key generation to separate file

/* eslint-disable no-console */

//#region type definitions ----------------------------------------------------
type CommandOptions = {
  clean: boolean;
  enums: Array<string>;
  replace: boolean;
  verbose: boolean;
  input: Array<string>;
  output: string;
};
//#endregion

//#region main block ----------------------------------------------------------
const command = getCommand();

const args = process.argv.slice(2);

// 🔥 intercept help/version BEFORE parse
if (args.includes('-h') || args.includes('--help')) {
  command.help();
}
if (args.includes('-V') || args.includes('--version')) {
  console.log(`${command.name()} v${command.version()}`);
  process.exit(0);
}

try {
  command.parse(process.argv);
  console.log(command.opts());
  const outputFiles = expandBraces(command.opts().output);
  outputFiles.forEach((f) => console.log(`out ${f}`));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} catch (_error: any) {
  process.exit(1);
}

try {
  const options = command.opts() as CommandOptions;
  writeEnumExtract(extractEnumKeys(options.enums));
  extractEnumKeys(options.enums);
  const files = glob.sync(options.input).map((file: string) => path.resolve(file));
  const outputFiles = expandBraces(options.output);
  outputFiles.forEach((f) => console.log(`out ${f}`));
  const keys = extractKeys(files);
  writeOutput(outputFiles, keys, options.replace, options.clean);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} catch (_error: any) {
  command.help();
}

//#endregion

/**
 * Build the command
 *
 * @returns the command
 */
function getCommand(): Command {
  return (
    new Command()
      .name('extract-i18n')
      .description('Extract translation keys')
      .version('1.0.0')
      .enablePositionalOptions(false)
      .requiredOption(
        '-i, --input <paths...>',
        'Paths you would like to extract strings from. You can use path expansion, glob patterns and multiple paths'
      )
      .requiredOption(
        '-o, --output <file>',
        'Paths where you would like to save extracted strings. You can use path expansion, glob patterns and multiple paths'
      )
      .option('-c, --clean', 'Remove obsolete strings after merge', false)
      .option('-r, --replace', 'Replace the contents of output file if it exists (Merges by default)', false)
      .option('-e, --enums <enums...>', 'an comma separated string of enums for which to extract keys')
      // TODO .option('-v, --verbose', 'remove existing keys', false)
      .allowUnknownOption(false)
      .showHelpAfterError()
  );
}

function expandBraces(pattern: string): Array<string> {
  const match = pattern.match(/\{([^}]+)\}/);
  if (!match) {
    return [pattern]; // no braces → single output
  }
  const values = match[1].split(',');
  return values.map((v) => path.resolve(pattern.replace(match[0], v)));
}

function extractKeys(files: Array<string>): Set<string> {
  const keys = new Set<string>();

  for (const file of files) {
    const regex = /extract\(['"`]([^'"`]+)['"`]\)/g;
    console.log(`reading file ${file}`);
    const content = fs.readFileSync(file, 'utf-8');
    let match;

    while ((match = regex.exec(content)) !== null) {
      const key = match[1].trim();
      if (key) {
        keys.add(key);
        console.log(` Extracted key ${key}`);
      }
    }
  }

  return keys;
}

function writeOutput(files: Array<string>, keys: Set<string>, replace: boolean, clean: boolean): void {
  files.forEach((f: string) => {
    if (replace || !existsSync(f)) {
      const directory = path.dirname(f);
      mkdirSync(directory, { recursive: true });
      fs.writeFileSync(
        f,
        JSON.stringify(
          Object.fromEntries([...keys].sort((a, b) => a.localeCompare(b)).map((k) => [k, null])),
          null,
          2
        ) + '\n'
      );
      console.log(`${f} → created with ${keys.size} new entries`);
    } else {
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
      const oldDictionary = JSON.parse(fs.readFileSync(f, 'utf-8'));
      let nullValues = 0;

      const newDictionary: Record<string, string | null> = {};
      const keysToSave = clean
        ? Array.from(keys)
        : Array.from(new Set<string>([...Object.keys(oldDictionary), ...keys]));
      /* eslint-disable @typescript-eslint/no-unsafe-assignment */
      /* eslint-disable @typescript-eslint/no-unsafe-call */
      /* eslint-disable @typescript-eslint/no-unsafe-member-access */
      keysToSave
        .sort((a, b) => a.localeCompare(b))
        .forEach((k: string) => {
          const oldTranslation =
            oldDictionary[k] && oldDictionary[k].toString().trim() !== '' ? oldDictionary[k] : null;
          if (oldTranslation == null) {
            nullValues++;
          }
          newDictionary[k] = oldTranslation;
        });
      /* eslint-enable @typescript-eslint/no-unsafe-assignment */
      /* eslint-enable @typescript-eslint/no-unsafe-call */
      /* eslint-enable @typescript-eslint/no-unsafe-member-access */
      fs.writeFileSync(f, JSON.stringify(newDictionary, null, 2) + '\n');
      console.log(`${f} → updated containing ${nullValues} null values`);
    }
  });
}

function extractEnumKeys(fileNames: Array<string>): Array<string> {
  const result = new Array<string>();
  const project = new Project();
  project.addSourceFilesAtPaths(fileNames);

  const sourceFiles = project.getSourceFiles();

  for (const sourceFile of sourceFiles) {
    const enums = sourceFile.getEnums();

    for (const enumDecl of enums) {
      const enumName = enumDecl.getName();

      // filter if needed
      const members = enumDecl.getMembers();

      const keys = members.map((m) => m.getName());
      result.push(...keys.map((k: string) => `Enum.${enumName}.Message.${k}`));
    }
  }
  return result;
}

function writeEnumExtract(keys: Array<string>): void {
  const enumTranslationKeyFile = 'src/app/core/services/enum-translation-keys.ts';
  console.log(`writing enum translation keys to ${enumTranslationKeyFile}`);
  fs.writeFileSync(enumTranslationKeyFile, `import { extract } from '../extract;'\n\n${buildEnumKeyLines(keys)}\n`);
}

function buildEnumKeyLines(keys: Array<string>): string {
  return keys.map((key: string) => `extract('${key}');`).join('\n');
}
