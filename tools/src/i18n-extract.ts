import { CommandBuilder } from './command-builder';
import { DiscoveryProcessor } from './discovery-processor';
import { EnumKeyExtractor } from './enum-key-extractor';
import { ExtractProcessor } from './extract-processor';
import { SourceKeyExtractor } from './source-key-extractor';

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
