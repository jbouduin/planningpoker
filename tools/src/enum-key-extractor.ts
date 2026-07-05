import { mkdirSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { Project } from 'ts-morph';

/* eslint-disable no-console */
export class EnumKeyExtractor {
  //#region Public Methods ----------------------------------------------------
  public process(enumFiles: Array<string>, targetFile: string): void {
    const keys = this.extractEnumKeys(enumFiles.map((file: string) => resolve(file)));
    this.writeEnumExtract(targetFile, keys);
  }
  //#endregion

  //#region Auxiliary Methods -------------------------------------------------
  private extractEnumKeys(fileNames: Array<string>): Array<string> {
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
        result.push(...keys.map((k: string) => `Enum.${enumName}.${k}`));
      }
    }
    return result;
  }

  private writeEnumExtract(targetFile: string, keys: Array<string>): void {
    const directory = dirname(targetFile);
    mkdirSync(directory, { recursive: true });
    console.log(`writing enum translation keys to ${targetFile}`);
    const header = `/* ****************************************************************************
 * This is a generated file. DO NOT change it.
 *****************************************************************************/
`;
    writeFileSync(targetFile, `${header}import { extract } from '../extract';\n\n${this.buildEnumKeyLines(keys)}\n`);
  }

  private buildEnumKeyLines(keys: Array<string>): string {
    return keys.map((key: string) => `extract('${key}');`).join('\n');
  }
  //#endregion
}
