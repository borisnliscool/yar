const fs = require('fs');

const version = process.env.VERSION;
const packagePath = 'package.json';

const package = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
package.version = version;

fs.writeFileSync(packagePath, JSON.stringify(package, null, 4));
console.log(`Bumped package version to ${version}.`);
