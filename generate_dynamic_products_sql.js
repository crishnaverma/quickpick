const fs = require('fs');
const path = require('path');

const seedPath = path.resolve(__dirname, 'server/src/database/seed.js');
const seedContent = fs.readFileSync(seedPath, 'utf8');

const startIdx = seedContent.indexOf('const productsData = [');
const endMarker = 'const createdProducts = [];';
const endIdx = seedContent.indexOf(endMarker, startIdx);
const productsCode = seedContent.substring(startIdx, endIdx);

const categoryMap = {
  'fruits': 'fruits',
  'vegetables': 'vegetables',
  'dairy': 'dairy',
  'bakery': 'bakery',
  'beverages': 'beverages',
  'snacks': 'snacks',
  'rice-grains': 'rice-grains',
  'personal-care': 'personal-care',
  'household': 'household'
};

const toImg = (arr) => arr;
const toVar = (val) => val;

let productsData = [];
try {
  const arrayOnly = productsCode.replace('const productsData =', '').trim();
  productsData = eval(arrayOnly);
} catch (e) {
  console.error('Eval error:', e);
}

console.log(`Loaded ${productsData.length} products`);

let sql = `-- ====================================================================
-- QuickPick 22 Products Insertion (Auto-linked to Categories)
-- ====================================================================

`;

for (let i = 0; i < productsData.length; i++) {
  const p = productsData[i];
  const prodId = `prod-grocery-${String(i + 1).padStart(3, '0')}`;
  const catSlug = p.categoryId; // 'fruits', 'vegetables', etc.
  const images = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
  const imagesPg = `ARRAY[${images.map(img => `'${img}'`).join(', ')}]::TEXT[]`;
  const variantsJson = p.variants ? (typeof p.variants === 'string' ? p.variants : JSON.stringify(p.variants)) : 'NULL';
  const desc = p.description.replace(/'/g, "''");
  const name = p.name.replace(/'/g, "''");
  const variantsVal = variantsJson !== 'NULL' ? `'${variantsJson.replace(/'/g, "''")}'::JSONB` : 'NULL';

  const catSubquery = `(SELECT "id" FROM "Category" WHERE "slug" = '${catSlug}' OR "slug" = '${catSlug === 'rice-grains' ? 'grains' : catSlug}' LIMIT 1)`;

  sql += `INSERT INTO "Product" ("id", "categoryId", "name", "slug", "description", "images", "unitType", "defaultUnit", "price", "compareAtPrice", "costPrice", "stockQuantity", "reservedStock", "minStockThreshold", "isAvailable", "isActive", "variants", "createdAt", "updatedAt") VALUES
('${prodId}', ${catSubquery}, '${name}', '${p.slug}', '${desc}', ${imagesPg}, '${p.unitType}', '${p.defaultUnit}', ${p.price}, ${p.compareAtPrice || 'NULL'}, ${p.costPrice || 'NULL'}, ${p.stockQuantity}, 0, ${p.minStockThreshold || 5}, true, true, ${variantsVal}, NOW(), NOW())
ON CONFLICT ("slug") DO UPDATE SET 
  "name" = EXCLUDED."name",
  "price" = EXCLUDED."price", 
  "images" = EXCLUDED."images",
  "stockQuantity" = EXCLUDED."stockQuantity",
  "isAvailable" = true,
  "isActive" = true;
`;
}

fs.writeFileSync(path.resolve(__dirname, 'server/prisma/insert_all_products.sql'), sql);
console.log('Successfully generated insert_all_products.sql with 22 products!');
