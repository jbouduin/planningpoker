const glob = require('glob')
const fs = require('fs');
const col = require('colorette');

const translationFiles = glob.GlobSync('src/translations/*-*.json');
const errors = [];

for (const translationFile of translationFiles.found) {
  console.log(col.gray(`- ${translationFile}`))
  const translations = JSON.parse(fs.readFileSync(translationFile, 'utf-8'));

  for (const key of Object.keys(translations)) {
    const value = translations[key];
    if (!value) {
      errors.push(`! ${translationFile} - ${key}`)
    }
  }
}

if (errors.length > 0) {
  for (const error of errors) {
    console.log(col.red(error));
  }
  console.log(col.red('\n--- Translations missing --- '));
  process.exit(1);
} else {
  console.log(col.green('\n--- Translations OK --- '));
  process.exit(0);
}