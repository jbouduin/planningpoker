import { Command } from 'commander';

export class CommandBuilder {
  //#region Private Fields ----------------------------------------------------
  private readonly optionDictionary: Map<string, string>;
  //#endregion

  //#region Constructor & C° --------------------------------------------------
  public constructor() {
    this.optionDictionary = new Map([
      [
        '-o, --output <file>',
        'Paths where you would like to save extracted strings. You can use path expansion, glob patterns and multiple paths'
      ]
    ]);
  }
  //#endregion

  //#region Public Methods ----------------------------------------------------
  /**
   * Builds the discovery command. It has no mandatory options and is used to
   * - discover the config file argument
   * - print help
   * - show version
   * @returns the discovery command
   */
  public buildDiscoveryCommand(): Command {
    return this.buildCommand(true);
  }

  /**
   * Build the command.
   *
   * @param configFile the resolved path the a configuration file. `null` when no configuration is to be used.
   * @returns the command
   */
  public buildExecutionCommand(loadedConfig: Record<string, unknown> | null): Command {
    const result = this.buildCommand(false);

    if (loadedConfig !== null) {
      for (const [key, value] of Object.entries(loadedConfig)) {
        if (result.getOptionValueSource(key) === undefined || result.getOptionValueSource(key) === 'default') {
          result.setOptionValueWithSource(key, value, 'config');
        }
      }
    }

    return result;
  }
  //#endregion

  //#region Auxiliary Methods -------------------------------------------------
  private buildCommand(isDiscovery: boolean): Command {
    const result = new Command()
      .showHelpAfterError(true)
      .version('1.0.0')
      .option('-p, --purge', 'Remove obsolete strings after merge', false)
      .option('-r, --replace', 'Replace the contents of output file if it exists', false)
      .option(
        '-e, --enums <file>',
        'a file containg enums for which to extract keys',
        this.optionCollector,
        new Array<string>()
      )
      .option('-c, --config [config]', 'Configuration file')
      .option(
        '-i, --ignore <ignore>',
        'Ignore pattern. This parameter can be repeated',
        this.optionCollector,
        new Array<string>()
      )
      .option('--enum-output [file]', 'The target output file for extracted enum keys. Required if -e is given.')
      .argument(
        '[paths...]',
        'Paths you would like to extract strings from. You can use path expansion, glob patterns and multiple paths',
        './**/*.{ts,js,html}'
      );

    this.optionDictionary.forEach((v: string, k: string) => {
      if (isDiscovery) {
        result.option(k, v);
      } else {
        result.requiredOption(k, v);
      }
    });
    return result;
  }

  private optionCollector<T>(value: T, previous: Array<T>): Array<T> {
    return [...previous, value];
  }
  //#endregion
}
