import { Pipe, PipeTransform } from '@angular/core';
import { marked } from 'marked';

@Pipe({
  name: 'markdown'
})
export class MarkdownPipe implements PipeTransform {
  public transform(value: unknown, ..._args: Array<unknown>): unknown {
    if (typeof value === 'string') {
      return this.afterParse(marked(value, { async: false, breaks: true, gfm: true }));
      // this.afterParse(marked(value, { gfm: true, smartLists: true, mangle: true }));
    }
    return value;
  }

  private afterParse(parseResult: string): string {
    // make external links open in a new window/tab
    // <a href="/api/pdf/references/se/de?target=_blank"> => <a href="/api/pdf/references/se/de" target="_blank">
    return parseResult.replace(/(<a href="\S+)\?target=_blank">/gm, '$1" target="_blank" rel="noopener noreferrer">');
  }
}
