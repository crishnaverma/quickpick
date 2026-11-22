const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, 'server/src/database/seed.js');
let content = fs.readFileSync(file, 'utf8');

const helper = `  const isPg = Boolean(process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('file:'));
  const toImg = (arr) => isPg ? arr : JSON.stringify(arr);
  const toVar = (val) => (val === null ? null : (isPg ? val : JSON.stringify(val)));

  const productsData = [`;

content = content.replace('  const productsData = [', helper);
content = content.replace(/images: JSON\.stringify\(/g, 'images: toImg(');
content = content.replace(/variants: JSON\.stringify\(/g, 'variants: toVar(');

fs.writeFileSync(file, content);
console.log('Successfully updated seed.js!');
