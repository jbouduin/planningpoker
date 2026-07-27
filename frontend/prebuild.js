const fs = require('fs');

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

const versionInfoFile = 'src/app/core/services/version-info.ts';
console.log(`writing version to ${versionInfoFile}`);
fs.writeFileSync(
  versionInfoFile,
  `export const versionInfo = {
  version: '${packageJson.version};\n'
}`
);

console.log('prebuild finished');
