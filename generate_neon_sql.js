const fs = require('fs');
const path = require('path');

// We will extract products from seed.js and generate clean PostgreSQL INSERT statements
const seedPath = path.resolve(__dirname, 'server/src/database/seed.js');
const seedContent = fs.readFileSync(seedPath, 'utf8');

// Parse productsData array from seed.js
const startIdx = seedContent.indexOf('const productsData = [');
const endMarker = 'const createdProducts = [];';
const endIdx = seedContent.indexOf(endMarker, startIdx);
const productsCode = seedContent.substring(startIdx, endIdx);

// Category mapping by slug
const categoryIds = {
  'fruits': 'cat-fruits',
  'vegetables': 'cat-vegetables',
  'dairy': 'cat-dairy',
  'bakery': 'cat-bakery',
  'beverages': 'cat-beverages',
  'snacks': 'cat-snacks',
  'grains': 'cat-grains',
  'personal-care': 'cat-personal',
  'household': 'cat-household'
};

const categoryMap = categoryIds;

// Evaluate products array safely
let productsData = [];
try {
  const arrayOnly = productsCode.replace('const productsData =', '').trim();
  productsData = eval(arrayOnly);
} catch (e) {
  console.error('Eval error:', e);
}

console.log(`Loaded ${productsData.length} products`);

let sql = `-- ====================================================================
-- QuickPick Complete Catalogue Seed for Neon PostgreSQL (22 Products & 9 Categories)
-- ====================================================================

-- 1. Insert Categories
INSERT INTO "Category" ("id", "name", "slug", "description", "image", "displayOrder", "isActive", "createdAt", "updatedAt") VALUES
('cat-fruits', 'Fresh Fruits', 'fruits', 'Farm-fresh seasonal and exotic fruits hand-selected for freshness.', 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=600&q=80', 1, true, NOW(), NOW()),
('cat-vegetables', 'Daily Vegetables', 'vegetables', 'Crisp, locally sourced greens, root vegetables, and fresh cooking staples.', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80', 2, true, NOW(), NOW()),
('cat-dairy', 'Dairy, Eggs & Paneer', 'dairy', 'Pure farm milk, rich butter, fresh artisan paneer, and farm-graded eggs.', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80', 3, true, NOW(), NOW()),
('cat-bakery', 'Bakery & Bread', 'bakery', 'Oven-fresh artisanal sourdough, whole wheat breads, and morning tea cakes.', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80', 4, true, NOW(), NOW()),
('cat-beverages', 'Beverages & Juices', 'beverages', 'Single-estate coffee, heritage tea blends, cold-pressed juices, and tender coconut water.', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80', 5, true, NOW(), NOW()),
('cat-snacks', 'Snacks & Munchies', 'snacks', 'Roasted gourmet dry fruits, savory namkeen, healthy crackers, and chocolates.', 'https://images.unsplash.com/photo-1621996346565-e3d5d6281699?auto=format&fit=crop&w=600&q=80', 6, true, NOW(), NOW()),
('cat-grains', 'Rice, Dal & Grains', 'grains', 'Aged aged royal basmati rice, organic unpolished pulses, and stone-ground flours.', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80', 7, true, NOW(), NOW()),
('cat-personal', 'Personal Care', 'personal-care', 'Everyday hygiene, gentle soaps, herbal shampoos, and sanitizers.', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80', 8, true, NOW(), NOW()),
('cat-household', 'Household Essentials', 'household', 'Eco-friendly cleaning supplies, kitchen rolls, paper goods, and detergents.', 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=600&q=80', 9, true, NOW(), NOW())
ON CONFLICT ("slug") DO NOTHING;

-- 2. Insert Products
`;

for (let i = 0; i < productsData.length; i++) {
  const p = productsData[i];
  const prodId = `prod-grocery-${String(i + 1).padStart(3, '0')}`;
  const images = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
  const imagesPg = `ARRAY[${images.map(img => `'${img}'`).join(', ')}]::TEXT[]`;
  const variantsJson = p.variants ? (typeof p.variants === 'string' ? p.variants : JSON.stringify(p.variants)) : 'NULL';
  const desc = p.description.replace(/'/g, "''");
  const name = p.name.replace(/'/g, "''");
  const variantsVal = variantsJson !== 'NULL' ? `'${variantsJson.replace(/'/g, "''")}'::JSONB` : 'NULL';

  sql += `INSERT INTO "Product" ("id", "categoryId", "name", "slug", "description", "images", "unitType", "defaultUnit", "price", "compareAtPrice", "costPrice", "stockQuantity", "reservedStock", "minStockThreshold", "isAvailable", "isActive", "variants", "createdAt", "updatedAt") VALUES
('${prodId}', '${p.categoryId}', '${name}', '${p.slug}', '${desc}', ${imagesPg}, '${p.unitType}', '${p.defaultUnit}', ${p.price}, ${p.compareAtPrice || 'NULL'}, ${p.costPrice || 'NULL'}, ${p.stockQuantity}, ${p.reservedStock || 0}, ${p.minStockThreshold || 5}, true, true, ${variantsVal}, NOW(), NOW())
ON CONFLICT ("slug") DO UPDATE SET "price" = EXCLUDED."price", "stockQuantity" = EXCLUDED."stockQuantity";
`;
}

sql += `
-- 3. Insert Pickup Slots (Today & Tomorrow)
INSERT INTO "PickupSlot" ("id", "date", "startTime", "endTime", "maxOrders", "bookedCount", "isClosed", "createdAt", "updatedAt") VALUES
('slot-t-01', CURRENT_DATE, '08:00', '08:30', 10, 0, false, NOW(), NOW()),
('slot-t-02', CURRENT_DATE, '08:30', '09:00', 10, 0, false, NOW(), NOW()),
('slot-t-03', CURRENT_DATE, '09:00', '09:30', 10, 0, false, NOW(), NOW()),
('slot-t-04', CURRENT_DATE, '09:30', '10:00', 10, 0, false, NOW(), NOW()),
('slot-t-05', CURRENT_DATE, '10:00', '10:30', 10, 0, false, NOW(), NOW()),
('slot-t-06', CURRENT_DATE, '10:30', '11:00', 10, 0, false, NOW(), NOW()),
('slot-t-07', CURRENT_DATE, '11:00', '11:30', 10, 0, false, NOW(), NOW()),
('slot-t-08', CURRENT_DATE, '11:30', '12:00', 10, 0, false, NOW(), NOW()),
('slot-t-09', CURRENT_DATE, '12:00', '12:30', 10, 0, false, NOW(), NOW()),
('slot-t-10', CURRENT_DATE, '14:00', '14:30', 10, 0, false, NOW(), NOW()),
('slot-t-11', CURRENT_DATE, '15:00', '15:30', 10, 0, false, NOW(), NOW()),
('slot-t-12', CURRENT_DATE, '16:00', '16:30', 10, 0, false, NOW(), NOW()),
('slot-t-13', CURRENT_DATE, '17:00', '17:30', 10, 0, false, NOW(), NOW()),
('slot-t-14', CURRENT_DATE, '18:00', '18:30', 10, 0, false, NOW(), NOW()),
('slot-t-15', CURRENT_DATE, '19:00', '19:30', 10, 0, false, NOW(), NOW()),
('slot-t-16', CURRENT_DATE, '20:00', '20:30', 10, 0, false, NOW(), NOW()),
('slot-tom-01', CURRENT_DATE + 1, '08:00', '08:30', 10, 0, false, NOW(), NOW()),
('slot-tom-02', CURRENT_DATE + 1, '09:00', '09:30', 10, 0, false, NOW(), NOW()),
('slot-tom-03', CURRENT_DATE + 1, '10:00', '10:30', 10, 0, false, NOW(), NOW()),
('slot-tom-04', CURRENT_DATE + 1, '11:00', '11:30', 10, 0, false, NOW(), NOW()),
('slot-tom-05', CURRENT_DATE + 1, '14:00', '14:30', 10, 0, false, NOW(), NOW()),
('slot-tom-06', CURRENT_DATE + 1, '16:00', '16:30', 10, 0, false, NOW(), NOW()),
('slot-tom-07', CURRENT_DATE + 1, '18:00', '18:30', 10, 0, false, NOW(), NOW()),
('slot-tom-08', CURRENT_DATE + 1, '20:00', '20:30', 10, 0, false, NOW(), NOW())
ON CONFLICT ("date", "startTime") DO NOTHING;
`;

fs.writeFileSync(path.resolve(__dirname, 'server/prisma/seed_products.sql'), sql);
console.log('Successfully generated seed_products.sql!');
