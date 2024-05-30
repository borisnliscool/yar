const fs = require('fs');

const version = process.env.VERSION;
const package = require('package.json');

package.version = version;
fs.writeFileSync('package.json', JSON.stringify(package, null, 4));
console.log(`Bumped package version to ${version}.`);
