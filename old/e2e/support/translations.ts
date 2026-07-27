import * as fs from 'fs';


class Translations {
  static en = JSON.parse(fs.readFileSync('src/translations/en-US.json', 'utf-8'));
  static de = JSON.parse(fs.readFileSync('src/translations/de-DE.json', 'utf-8'));

  static getTranslations(key: string): Array<string> {
    return [Translations.en[key], Translations.de[key]];
  }
}
export default Translations
