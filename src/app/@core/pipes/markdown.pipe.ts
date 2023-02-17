import { Pipe, PipeTransform } from '@angular/core';
import { marked } from 'marked'

@Pipe({
  name: 'markdown'
})
export class MarkdownPipe implements PipeTransform {

  //#region PipeTransform interface methods -----------------------------------
  public transform(value: unknown, ..._args: unknown[]): unknown {
    if (typeof value === 'string') {
      return this.afterParse(marked(value, { gfm: true, smartLists: true, mangle: true }));
    }
    return value;
  }
  //#endregion

  private afterParse(parseResult: string): string {
    // make external links open in a new window/tab
    // <a href="/api/pdf/references/se/de?target=_blank"> => <a href="/api/pdf/references/se/de" target="_blank">
    return parseResult.replace(/(<a href="\S+)\?target=_blank">/gm, "$1\" target=\"_blank\">"  );

  }
}
