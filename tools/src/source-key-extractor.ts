import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname } from 'path';

/* eslint-disable no-console */
export class SourceKeyExtractor {
  //#region Public Methods ----------------------------------------------------
  public process(sourceFiles: Array<string>, outputFiles: Array<string>, replace: boolean, purge: boolean): void {
    const keys = this.extractKeys(sourceFiles);
    this.writeOutput(outputFiles, keys, replace, purge);
  }
  //#endregion

  //#region Auxiliary Methods -------------------------------------------------
  private extractKeys(files: Array<string>): Set<string> {
    const keys = new Set<string>();

    for (const file of files) {
      const regex = /extract\(['"`]([^'"`]+)['"`]\)/g;
      console.log(`reading file ${file}`);
      const content = readFileSync(file, 'utf-8');
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

  private writeOutput(files: Array<string>, keys: Set<string>, replace: boolean, purge: boolean): void {
    files.forEach((f: string) => {
      if (replace || !existsSync(f)) {
        const directory = dirname(f);
        mkdirSync(directory, { recursive: true });
        writeFileSync(
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
        const oldDictionary = JSON.parse(readFileSync(f, 'utf-8'));
        let nullValues = 0;

        const newDictionary: Record<string, string | null> = {};
        const keysToSave = purge
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
        writeFileSync(f, JSON.stringify(newDictionary, null, 2) + '\n');
        console.log(`${f} → updated containing ${nullValues} null values`);
      }
    });
  }
  //#endregion
}
