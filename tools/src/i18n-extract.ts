import { CommandBuilder, DiscoveryProcessor, EnumKeyExtractor, ExtractProcessor, SourceKeyExtractor } from './lib';

//#region main block ----------------------------------------------------------
main();

function main(): void {
  const commandBuilder = new CommandBuilder();
  const discoveryProcessor = new DiscoveryProcessor(commandBuilder);
  discoveryProcessor.process(process.argv);
  const loadedConfig = discoveryProcessor.loadedConfig;
  const extractProcessor = new ExtractProcessor(commandBuilder, loadedConfig);
  extractProcessor.process(new EnumKeyExtractor(), new SourceKeyExtractor(), process.argv);
}
//#endregion
