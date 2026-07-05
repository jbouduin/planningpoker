import { Command } from 'commander';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { CommandBuilder } from './command-builder';
import { ParsedCommandOptions } from './parsed-command-options';

export class DiscoveryProcessor {
  //#region Static ------------------------------------------------------------
  public static RC_FILE = '.i18n-extractrc';
  //#endregion

  //#region Private Fields ----------------------------------------------------
  private _loadedConfig: Record<string, unknown>;
  private readonly command: Command;
  //#endregion

  //#region Getters -----------------------------------------------------------
  public get loadedConfig(): Record<string, unknown> {
    return this._loadedConfig;
  }
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor(commandBuilder: CommandBuilder) {
    this.command = commandBuilder.buildDiscoveryCommand();
    this._loadedConfig = {};
  }
  //#endregion

  //#region Public Methods ----------------------------------------------------
  public process(argv: Array<string>): void {
    this.command.parse(argv);
    const discoveryOptions = this.command.opts() as ParsedCommandOptions;
    this.loadConfigFile(discoveryOptions);
  }
  //#endregion

  //#region Auxiliary Methods -------------------------------------------------
  private loadConfigFile(discoveryOptions: ParsedCommandOptions): void {
    let configurationPath: string | null = null;

    if (!discoveryOptions.config) {
      // console.log('No configuration file argument given');
      const rcPath = resolve(DiscoveryProcessor.RC_FILE);
      if (existsSync(rcPath)) {
        configurationPath = rcPath;
      }
    } else {
      // console.log(`Configuration file argument ${discoveryOptions.config}`);
      configurationPath = resolve(discoveryOptions.config);
    }

    if (configurationPath !== null) {
      if (existsSync(configurationPath)) {
        this._loadedConfig = JSON.parse(readFileSync(configurationPath, 'utf-8')) as Record<string, unknown>;
      } else {
        this.command.error(`Error: Configuration file ${discoveryOptions.config} not found`);
      }
    }
  }
  //#endregion
}
