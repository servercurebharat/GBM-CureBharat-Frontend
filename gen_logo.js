const fs = require('fs');
const b64 = fs.readFileSync('./public/curebharat-logo-22.png').toString('base64');
const dataUri = 'data:image/png;base64,' + b64;
const content = 'export const LOGO_BASE64 = ' + JSON.stringify(dataUri) + ';\n';
fs.writeFileSync('./lib/logoData.ts', content);
console.log('Done! File size:', content.length, 'bytes');
