import { Command } from 'commander';
import { existsSync, lstatSync } from 'fs';
import * as glob from 'glob';
import { resolve } from 'path';
import { CommandBuilder } from './command-builder';
import { EnumKeyExtractor } from './enum-key-extractor';
import { ParsedCommandOptions } from './parsed-command-options';
import { SourceKeyExtractor } from './source-key-extractor';

export class ExtractProcessor {
  //#region Private Fields ----------------------------------------------------
  private readonly command: Command;
  private readonly loadedConfig: Record<string, unknown>;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(commandBuilder: CommandBuilder, loadedConfig: Record<string, unknown>) {
    this.command = commandBuilder.buildExecutionCommand(loadedConfig);

    this.loadedConfig = loadedConfig;
  }
  //#endregion

  //#region Public Methods ----------------------------------------------------
  public process(
    enumKeyExtractor: EnumKeyExtractor,
    sourceKeyExtractor: SourceKeyExtractor,
    argv: Array<string>
  ): void {
    // --- Step 1: process the parameters ---
    this.command.parse(argv);
    // console.debug(this.command.opts());
    // console.debug(this.command.processedArgs[0]);
    const options = this.command.opts() as ParsedCommandOptions;

    // --- Step 2: additional parameter checks ---
    if (options.enums.length > 0 && !options.enumOutput) {
      this.command.error('Error: Option "--enum-output" not specified, altough "-e, --enums <file>" is specified');
    }

    // --- Step 3: process the enum files ---
    enumKeyExtractor.process(options.enums, options.enumOutput);

    // --- Step 4: process the source files ---
    let expandedArgs: Array<string> | null = null;
    if (this.command.args.length > 0) {
      expandedArgs = this.expandArgsOrOption(this.command.args as Array<string>);
    } else if (this.loadedConfig !== null && this.loadedConfig['sources']) {
      const sources = Array.isArray(this.loadedConfig['sources'])
        ? this.loadedConfig['sources']
        : [this.loadedConfig['sources']];
      expandedArgs = this.expandArgsOrOption(sources);
    }
    if (expandedArgs === null) {
      expandedArgs = this.expandArgsOrOption(this.command.processedArgs[0] as Array<string>);
    }
    const expandedIgnores = this.expandArgsOrOption(options.ignore);
    // console.log('Expanded args', expandedArgs);
    // console.log('expanded ignores', expandedIgnores);
    const files = glob.sync(expandedArgs, { absolute: true, ignore: expandedIgnores, nodir: true });
    const outputFiles = this.expandBraces(options.output);

    sourceKeyExtractor.process(files, outputFiles, options.replace, options.purge);
  }
  //#endregion

  //#region Auxiliary Methods -------------------------------------------------
  private expandArgsOrOption(toExpand: Array<string>): Array<string> {
    return toExpand.map((arg: string) => {
      if (!arg.match(/[\*,\{,\[,\?]/)) {
        if (existsSync(arg)) {
          const lstat = lstatSync(arg);
          if (lstat.isDirectory()) {
            return arg.endsWith('/') ? arg + '**/*' : arg + '/**/*';
          } else {
            return arg;
          }
        } else {
          return arg;
        }
      } else {
        return arg;
      }
    });
  }

  private expandBraces(pattern: string): Array<string> {
    const match = pattern.match(/\{([^}]+)\}/);
    if (!match) {
      return [resolve(pattern)]; // no braces → single output
    }
    const values = match[1].split(',');
    return values.map((v) => resolve(pattern.replace(match[0], v)));
  }
  //#endregion
}
