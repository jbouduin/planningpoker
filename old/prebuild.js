const fs = require('fs');
const package = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

console.log('writing version to src/app/@core/services/version-info.ts');
fs.writeFileSync(
  'src/app/@core/services/version-info.ts',
`export const versionInfo = {
  version: '${package.version}'
}`);

console.log('prebuild finished');


