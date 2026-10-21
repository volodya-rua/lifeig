// Copies the web app into a wrapper's folder before building: node ../copy-web.js <folder>
const fs = require('fs'), path = require('path');
const out = path.resolve(process.argv[2]);
fs.mkdirSync(out, { recursive: true });
for (const f of ['index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png']) fs.copyFileSync(path.join(__dirname, f), path.join(out, f));
fs.cpSync(path.join(__dirname, 'fonts'), path.join(out, 'fonts'), { recursive: true });
