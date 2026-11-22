-- ====================================================================
-- QuickPick 22 Products Insertion (Auto-linked to Categories)
-- ====================================================================

INSERT INTO "Product" ("id", "categoryId", "name", "slug", "description", "images", "unitType", "defaultUnit", "price", "compareAtPrice", "costPrice", "stockQuantity", "reservedStock", "minStockThreshold", "isAvailable", "isActive", "variants", "createdAt", "updatedAt") VALUES
('prod-grocery-001', (SELECT "id" FROM "Category" WHERE "slug" = 'fruits' OR "slug" = 'fruits' LIMIT 1), 'Royal Gala Crisp Apples (Shimla Fresh)', 'royal-gala-apples', 'Crisp, sweet, and juicy red apples sourced directly from Himachal orchards. Rich in dietary fiber and antioxidants.', ARRAY['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80']::TEXT[], 'WEIGHT', '1 kg', 180, 220, 130, 45, 0, 10, true, true, '[{"label":"500g","multiplier":0.5,"price":95},{"label":"1 kg","multiplier":1,"price":180},{"label":"2 kg","multiplier":2,"price":345}]'::JSONB, NOW(), NOW())
ON CONFLICT ("slug") DO UPDATE SET 
  "name" = EXCLUDED."name",
  "price" = EXCLUDED."price", 
  "images" = EXCLUDED."images",
  "stockQuantity" = EXCLUDED."stockQuantity",
  "isAvailable" = true,
  "isActive" = true;
INSERT INTO "Product" ("id", "categoryId", "name", "slug", "description", "images", "unitType", "defaultUnit", "price", "compareAtPrice", "costPrice", "stockQuantity", "reservedStock", "minStockThreshold", "isAvailable", "isActive", "variants", "createdAt", "updatedAt") VALUES
('prod-grocery-002', (SELECT "id" FROM "Category" WHERE "slug" = 'fruits' OR "slug" = 'fruits' LIMIT 1), 'Organic Robusta Bananas', 'organic-robusta-bananas', 'Naturally ripened, rich in potassium and energy. Perfect for breakfast smoothies and quick healthy snacking.', ARRAY['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80']::TEXT[], 'WEIGHT', '1 kg', 60, 75, 38, 60, 0, 15, true, true, '[{"label":"500g (~3-4 pcs)","multiplier":0.5,"price":32},{"label":"1 kg (~6-8 pcs)","multiplier":1,"price":60}]'::JSONB, NOW(), NOW())
ON CONFLICT ("slug") DO UPDATE SET 
  "name" = EXCLUDED."name",
  "price" = EXCLUDED."price", 
  "images" = EXCLUDED."images",
  "stockQuantity" = EXCLUDED."stockQuantity",
  "isAvailable" = true,
  "isActive" = true;
INSERT INTO "Product" ("id", "categoryId", "name", "slug", "description", "images", "unitType", "defaultUnit", "price", "compareAtPrice", "costPrice", "stockQuantity", "reservedStock", "minStockThreshold", "isAvailable", "isActive", "variants", "createdAt", "updatedAt") VALUES
('prod-grocery-003', (SELECT "id" FROM "Category" WHERE "slug" = 'fruits' OR "slug" = 'fruits' LIMIT 1), 'Alphonso Mangoes (Devgad Reserve)', 'alphonso-mangoes', 'The King of Mangoes! Distinct saffron pulp, rich aromatic sweetness, and buttery texture. GI-tagged authentic produce.', ARRAY['https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80']::TEXT[], 'FIXED', 'Box of 6 pcs', 499, 599, 360, 18, 0, 5, true, true, NULL, NOW(), NOW())
ON CONFLICT ("slug") DO UPDATE SET 
  "name" = EXCLUDED."name",
  "price" = EXCLUDED."price", 
  "images" = EXCLUDED."images",
  "stockQuantity" = EXCLUDED."stockQuantity",
  "isAvailable" = true,
  "isActive" = true;
INSERT INTO "Product" ("id", "categoryId", "name", "slug", "description", "images", "unitType", "defaultUnit", "price", "compareAtPrice", "costPrice", "stockQuantity", "reservedStock", "minStockThreshold", "isAvailable", "isActive", "variants", "createdAt", "updatedAt") VALUES
('prod-grocery-004', (SELECT "id" FROM "Category" WHERE "slug" = 'fruits' OR "slug" = 'fruits' LIMIT 1), 'Sweet Ruby Pomegranate (Kesar)', 'ruby-pomegranate', 'Deep ruby-red arils bursting with sweet, refreshing juice. Carefully graded for high sweetness and soft seeds.', ARRAY['https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80']::TEXT[], 'WEIGHT', '1 kg', 210, 260, 150, 28, 0, 8, true, true, '[{"label":"500g (~2 pcs)","multiplier":0.5,"price":110},{"label":"1 kg (~4 pcs)","multiplier":1,"price":210}]'::JSONB, NOW(), NOW())
ON CONFLICT ("slug") DO UPDATE SET 
  "name" = EXCLUDED."name",
  "price" = EXCLUDED."price", 
  "images" = EXCLUDED."images",
  "stockQuantity" = EXCLUDED."stockQuantity",
  "isAvailable" = true,
  "isActive" = true;
INSERT INTO "Product" ("id", "categoryId", "name", "slug", "description", "images", "unitType", "defaultUnit", "price", "compareAtPrice", "costPrice", "stockQuantity", "reservedStock", "minStockThreshold", "isAvailable", "isActive", "variants", "createdAt", "updatedAt") VALUES
('prod-grocery-005', (SELECT "id" FROM "Category" WHERE "slug" = 'vegetables' OR "slug" = 'vegetables' LIMIT 1), 'Vine-Ripened Country Tomatoes', 'vine-ripened-tomatoes', 'Plump, tangy, farm-fresh local tomatoes. Ideal for curries, rasam, salads, and fresh salsa.', ARRAY['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80']::TEXT[], 'WEIGHT', '1 kg', 45, 55, 28, 80, 0, 20, true, true, '[{"label":"500g","multiplier":0.5,"price":24},{"label":"1 kg","multiplier":1,"price":45},{"label":"2 kg","multiplier":2,"price":86}]'::JSONB, NOW(), NOW())
ON CONFLICT ("slug") DO UPDATE SET 
  "name" = EXCLUDED."name",
  "price" = EXCLUDED."price", 
  "images" = EXCLUDED."images",
  "stockQuantity" = EXCLUDED."stockQuantity",
  "isAvailable" = true,
  "isActive" = true;
INSERT INTO "Product" ("id", "categoryId", "name", "slug", "description", "images", "unitType", "defaultUnit", "price", "compareAtPrice", "costPrice", "stockQuantity", "reservedStock", "minStockThreshold", "isAvailable", "isActive", "variants", "createdAt", "updatedAt") VALUES
('prod-grocery-006', (SELECT "id" FROM "Category" WHERE "slug" = 'vegetables' OR "slug" = 'vegetables' LIMIT 1), 'Nashik Red Onions (Premium Grade)', 'nashik-red-onions', 'Firm, dry-skinned, pungent red onions. Essential kitchen staple with long shelf life and punchy flavor.', ARRAY['https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80']::TEXT[], 'WEIGHT', '1 kg', 52, 65, 35, 120, 0, 25, true, true, '[{"label":"1 kg","multiplier":1,"price":52},{"label":"2 kg","multiplier":2,"price":98},{"label":"5 kg (Saver Pack)","multiplier":5,"price":235}]'::JSONB, NOW(), NOW())
ON CONFLICT ("slug") DO UPDATE SET 
  "name" = EXCLUDED."name",
  "price" = EXCLUDED."price", 
  "images" = EXCLUDED."images",
  "stockQuantity" = EXCLUDED."stockQuantity",
  "isAvailable" = true,
  "isActive" = true;
INSERT INTO "Product" ("id", "categoryId", "name", "slug", "description", "images", "unitType", "defaultUnit", "price", "compareAtPrice", "costPrice", "stockQuantity", "reservedStock", "minStockThreshold", "isAvailable", "isActive", "variants", "createdAt", "updatedAt") VALUES
('prod-grocery-007', (SELECT "id" FROM "Category" WHERE "slug" = 'vegetables' OR "slug" = 'vegetables' LIMIT 1), 'Golden Baby Potatoes', 'golden-baby-potatoes', 'Tender baby potatoes with thin skins. Ideal for Dum Aloo, roasts, boiling, and crispy wedges.', ARRAY['https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80']::TEXT[], 'WEIGHT', '1 kg', 40, 50, 25, 90, 0, 20, true, true, '[{"label":"1 kg","multiplier":1,"price":40},{"label":"2 kg","multiplier":2,"price":76}]'::JSONB, NOW(), NOW())
ON CONFLICT ("slug") DO UPDATE SET 
  "name" = EXCLUDED."name",
  "price" = EXCLUDED."price", 
  "images" = EXCLUDED."images",
  "stockQuantity" = EXCLUDED."stockQuantity",
  "isAvailable" = true,
  "isActive" = true;
INSERT INTO "Product" ("id", "categoryId", "name", "slug", "description", "images", "unitType", "defaultUnit", "price", "compareAtPrice", "costPrice", "stockQuantity", "reservedStock", "minStockThreshold", "isAvailable", "isActive", "variants", "createdAt", "updatedAt") VALUES
('prod-grocery-008', (SELECT "id" FROM "Category" WHERE "slug" = 'vegetables' OR "slug" = 'vegetables' LIMIT 1), 'Crisp English Cucumbers', 'crisp-english-cucumbers', 'Seedless, thin-skinned and extra hydrating. Excellent for raita, cooling summer salads and detox water.', ARRAY['https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=800&q=80']::TEXT[], 'WEIGHT', '500g', 35, 45, 20, 35, 0, 10, true, true, '[{"label":"500g (~2 pcs)","multiplier":0.5,"price":35},{"label":"1 kg (~4 pcs)","multiplier":1,"price":65}]'::JSONB, NOW(), NOW())
ON CONFLICT ("slug") DO UPDATE SET 
  "name" = EXCLUDED."name",
  "price" = EXCLUDED."price", 
  "images" = EXCLUDED."images",
  "stockQuantity" = EXCLUDED."stockQuantity",
  "isAvailable" = true,
  "isActive" = true;
INSERT INTO "Product" ("id", "categoryId", "name", "slug", "description", "images", "unitType", "defaultUnit", "price", "compareAtPrice", "costPrice", "stockQuantity", "reservedStock", "minStockThreshold", "isAvailable", "isActive", "variants", "createdAt", "updatedAt") VALUES
('prod-grocery-009', (SELECT "id" FROM "Category" WHERE "slug" = 'vegetables' OR "slug" = 'vegetables' LIMIT 1), 'Hydroponic Tender Spinach (Palak)', 'tender-spinach-palak', 'Washed, soil-free tender baby spinach leaves. High iron, vitamin K and fresh earthy aroma.', ARRAY['https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80']::TEXT[], 'FIXED', 'Pack of 2 bunches (250g)', 38, 50, 22, 24, 0, 6, true, true, NULL, NOW(), NOW())
ON CONFLICT ("slug") DO UPDATE SET 
  "name" = EXCLUDED."name",
  "price" = EXCLUDED."price", 
  "images" = EXCLUDED."images",
  "stockQuantity" = EXCLUDED."stockQuantity",
  "isAvailable" = true,
  "isActive" = true;
INSERT INTO "Product" ("id", "categoryId", "name", "slug", "description", "images", "unitType", "defaultUnit", "price", "compareAtPrice", "costPrice", "stockQuantity", "reservedStock", "minStockThreshold", "isAvailable", "isActive", "variants", "createdAt", "updatedAt") VALUES
('prod-grocery-010', (SELECT "id" FROM "Category" WHERE "slug" = 'dairy' OR "slug" = 'dairy' LIMIT 1), 'Farm-Fresh Pasteurized Whole Milk (3.5% Fat)', 'farm-fresh-whole-milk', 'Pure, rich whole milk delivered cold daily from local dairy farms. No preservatives or adulterants.', ARRAY['https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=800&q=80']::TEXT[], 'FIXED', '1 Litre Pouch', 68, 72, 55, 50, 0, 15, true, true, NULL, NOW(), NOW())
ON CONFLICT ("slug") DO UPDATE SET 
  "name" = EXCLUDED."name",
  "price" = EXCLUDED."price", 
  "images" = EXCLUDED."images",
  "stockQuantity" = EXCLUDED."stockQuantity",
  "isAvailable" = true,
  "isActive" = true;
INSERT INTO "Product" ("id", "categoryId", "name", "slug", "description", "images", "unitType", "defaultUnit", "price", "compareAtPrice", "costPrice", "stockQuantity", "reservedStock", "minStockThreshold", "isAvailable", "isActive", "variants", "createdAt", "updatedAt") VALUES
('prod-grocery-011', (SELECT "id" FROM "Category" WHERE "slug" = 'dairy' OR "slug" = 'dairy' LIMIT 1), 'Artisanal Malai Paneer (Fresh Cottage Cheese)', 'artisanal-malai-paneer', 'Melt-in-mouth soft paneer made from pure cow milk. High protein, velvety texture, ideal for shahi paneer and tikka.', ARRAY['https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80']::TEXT[], 'WEIGHT', '200g', 105, 120, 78, 30, 0, 8, true, true, '[{"label":"200g block","multiplier":1,"price":105},{"label":"400g block (Value Pack)","multiplier":2,"price":198}]'::JSONB, NOW(), NOW())
ON CONFLICT ("slug") DO UPDATE SET 
  "name" = EXCLUDED."name",
  "price" = EXCLUDED."price", 
  "images" = EXCLUDED."images",
  "stockQuantity" = EXCLUDED."stockQuantity",
  "isAvailable" = true,
  "isActive" = true;
INSERT INTO "Product" ("id", "categoryId", "name", "slug", "description", "images", "unitType", "defaultUnit", "price", "compareAtPrice", "costPrice", "stockQuantity", "reservedStock", "minStockThreshold", "isAvailable", "isActive", "variants", "createdAt", "updatedAt") VALUES
('prod-grocery-012', (SELECT "id" FROM "Category" WHERE "slug" = 'dairy' OR "slug" = 'dairy' LIMIT 1), 'Free-Range Organic Brown Eggs', 'free-range-brown-eggs', 'Farm-fresh nutritious brown eggs from pasture-raised hens fed organic grains and herbs.', ARRAY['https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?auto=format&fit=crop&w=800&q=80']::TEXT[], 'FIXED', 'Pack of 12 eggs', 135, 160, 95, 40, 0, 10, true, true, NULL, NOW(), NOW())
ON CONFLICT ("slug") DO UPDATE SET 
  "name" = EXCLUDED."name",
  "price" = EXCLUDED."price", 
  "images" = EXCLUDED."images",
  "stockQuantity" = EXCLUDED."stockQuantity",
  "isAvailable" = true,
  "isActive" = true;
INSERT INTO "Product" ("id", "categoryId", "name", "slug", "description", "images", "unitType", "defaultUnit", "price", "compareAtPrice", "costPrice", "stockQuantity", "reservedStock", "minStockThreshold", "isAvailable", "isActive", "variants", "createdAt", "updatedAt") VALUES
('prod-grocery-013', (SELECT "id" FROM "Category" WHERE "slug" = 'dairy' OR "slug" = 'dairy' LIMIT 1), 'A2 Vedic Desi Cow Bilona Ghee', 'a2-desi-cow-bilona-ghee', 'Traditional slow-cooked bilona ghee from grass-fed Gir cows. Rich aroma, golden granulations, Ayurvedic digestive benefits.', ARRAY['https://images.unsplash.com/photo-1631452180677-7429188e7343?auto=format&fit=crop&w=800&q=80']::TEXT[], 'FIXED', '500 ml Glass Jar', 699, 850, 480, 15, 0, 4, true, true, NULL, NOW(), NOW())
ON CONFLICT ("slug") DO UPDATE SET 
  "name" = EXCLUDED."name",
  "price" = EXCLUDED."price", 
  "images" = EXCLUDED."images",
  "stockQuantity" = EXCLUDED."stockQuantity",
  "isAvailable" = true,
  "isActive" = true;
INSERT INTO "Product" ("id", "categoryId", "name", "slug", "description", "images", "unitType", "defaultUnit", "price", "compareAtPrice", "costPrice", "stockQuantity", "reservedStock", "minStockThreshold", "isAvailable", "isActive", "variants", "createdAt", "updatedAt") VALUES
('prod-grocery-014', (SELECT "id" FROM "Category" WHERE "slug" = 'bakery' OR "slug" = 'bakery' LIMIT 1), 'Artisan Whole Wheat Sourdough Loaf', 'whole-wheat-sourdough-loaf', 'Naturally fermented for 24 hours with wild yeast culture. Crisp crackly crust, open crumb, and wholesome gut-friendly tang.', ARRAY['https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80']::TEXT[], 'FIXED', '400g Loaf (Sliced)', 110, 135, 70, 22, 0, 5, true, true, NULL, NOW(), NOW())
ON CONFLICT ("slug") DO UPDATE SET 
  "name" = EXCLUDED."name",
  "price" = EXCLUDED."price", 
  "images" = EXCLUDED."images",
  "stockQuantity" = EXCLUDED."stockQuantity",
  "isAvailable" = true,
  "isActive" = true;
INSERT INTO "Product" ("id", "categoryId", "name", "slug", "description", "images", "unitType", "defaultUnit", "price", "compareAtPrice", "costPrice", "stockQuantity", "reservedStock", "minStockThreshold", "isAvailable", "isActive", "variants", "createdAt", "updatedAt") VALUES
('prod-grocery-015', (SELECT "id" FROM "Category" WHERE "slug" = 'bakery' OR "slug" = 'bakery' LIMIT 1), 'Fresh Mumbai Pav Buns (Zero Maida)', 'fresh-mumbai-pav-buns', 'Fluffy, cloud-soft whole wheat dinner rolls. Made fresh every morning, perfect companion for Misal and Bhaji.', ARRAY['https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80']::TEXT[], 'FIXED', 'Pack of 6 pcs', 45, 55, 26, 35, 0, 8, true, true, NULL, NOW(), NOW())
ON CONFLICT ("slug") DO UPDATE SET 
  "name" = EXCLUDED."name",
  "price" = EXCLUDED."price", 
  "images" = EXCLUDED."images",
  "stockQuantity" = EXCLUDED."stockQuantity",
  "isAvailable" = true,
  "isActive" = true;
INSERT INTO "Product" ("id", "categoryId", "name", "slug", "description", "images", "unitType", "defaultUnit", "price", "compareAtPrice", "costPrice", "stockQuantity", "reservedStock", "minStockThreshold", "isAvailable", "isActive", "variants", "createdAt", "updatedAt") VALUES
('prod-grocery-016', (SELECT "id" FROM "Category" WHERE "slug" = 'beverages' OR "slug" = 'beverages' LIMIT 1), 'Raw Cold-Pressed Valencia Orange Juice', 'raw-valencia-orange-juice', '100% pure Valencia oranges cold-pressed with zero added sugar, water or preservatives. Vitamin C booster.', ARRAY['https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80']::TEXT[], 'FIXED', '1 Litre Bottle', 165, 195, 115, 20, 0, 6, true, true, NULL, NOW(), NOW())
ON CONFLICT ("slug") DO UPDATE SET 
  "name" = EXCLUDED."name",
  "price" = EXCLUDED."price", 
  "images" = EXCLUDED."images",
  "stockQuantity" = EXCLUDED."stockQuantity",
  "isAvailable" = true,
  "isActive" = true;
INSERT INTO "Product" ("id", "categoryId", "name", "slug", "description", "images", "unitType", "defaultUnit", "price", "compareAtPrice", "costPrice", "stockQuantity", "reservedStock", "minStockThreshold", "isAvailable", "isActive", "variants", "createdAt", "updatedAt") VALUES
('prod-grocery-017', (SELECT "id" FROM "Category" WHERE "slug" = 'beverages' OR "slug" = 'beverages' LIMIT 1), 'Authentic South Indian Degree Filter Coffee Powder', 'south-indian-filter-coffee', 'Chikmagalur Arabica-Robusta blend roasted to dark perfection with 15% chicory for thick golden decoction.', ARRAY['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80']::TEXT[], 'WEIGHT', '250g', 175, 210, 110, 40, 0, 8, true, true, '[{"label":"250g pouch","multiplier":1,"price":175},{"label":"500g pouch (Saver)","multiplier":2,"price":330}]'::JSONB, NOW(), NOW())
ON CONFLICT ("slug") DO UPDATE SET 
  "name" = EXCLUDED."name",
  "price" = EXCLUDED."price", 
  "images" = EXCLUDED."images",
  "stockQuantity" = EXCLUDED."stockQuantity",
  "isAvailable" = true,
  "isActive" = true;
INSERT INTO "Product" ("id", "categoryId", "name", "slug", "description", "images", "unitType", "defaultUnit", "price", "compareAtPrice", "costPrice", "stockQuantity", "reservedStock", "minStockThreshold", "isAvailable", "isActive", "variants", "createdAt", "updatedAt") VALUES
('prod-grocery-018', (SELECT "id" FROM "Category" WHERE "slug" = 'snacks' OR "slug" = 'snacks' LIMIT 1), 'California Jumbo Almonds (Badam) - Slow Roasted', 'california-jumbo-almonds', 'Crisp, crunchy California Nonpareil almonds slow-roasted with Himalayan pink salt. High in vitamin E and healthy fats.', ARRAY['https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=800&q=80']::TEXT[], 'WEIGHT', '250g', 280, 340, 190, 32, 0, 8, true, true, '[{"label":"250g pouch","multiplier":1,"price":280},{"label":"500g pouch","multiplier":2,"price":540}]'::JSONB, NOW(), NOW())
ON CONFLICT ("slug") DO UPDATE SET 
  "name" = EXCLUDED."name",
  "price" = EXCLUDED."price", 
  "images" = EXCLUDED."images",
  "stockQuantity" = EXCLUDED."stockQuantity",
  "isAvailable" = true,
  "isActive" = true;
INSERT INTO "Product" ("id", "categoryId", "name", "slug", "description", "images", "unitType", "defaultUnit", "price", "compareAtPrice", "costPrice", "stockQuantity", "reservedStock", "minStockThreshold", "isAvailable", "isActive", "variants", "createdAt", "updatedAt") VALUES
('prod-grocery-019', (SELECT "id" FROM "Category" WHERE "slug" = 'rice-grains' OR "slug" = 'grains' LIMIT 1), 'Royal Aged Kohinoor Basmati Rice (2 Years Aged)', 'royal-aged-basmati-rice', 'Extra long slender grains that elongate up to 2.5x upon cooking with enchanting royal aroma. Perfect for biryani & pulao.', ARRAY['https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80']::TEXT[], 'WEIGHT', '1 kg', 195, 240, 140, 65, 0, 15, true, true, '[{"label":"1 kg pack","multiplier":1,"price":195},{"label":"5 kg bag (Value)","multiplier":5,"price":899}]'::JSONB, NOW(), NOW())
ON CONFLICT ("slug") DO UPDATE SET 
  "name" = EXCLUDED."name",
  "price" = EXCLUDED."price", 
  "images" = EXCLUDED."images",
  "stockQuantity" = EXCLUDED."stockQuantity",
  "isAvailable" = true,
  "isActive" = true;
INSERT INTO "Product" ("id", "categoryId", "name", "slug", "description", "images", "unitType", "defaultUnit", "price", "compareAtPrice", "costPrice", "stockQuantity", "reservedStock", "minStockThreshold", "isAvailable", "isActive", "variants", "createdAt", "updatedAt") VALUES
('prod-grocery-020', (SELECT "id" FROM "Category" WHERE "slug" = 'rice-grains' OR "slug" = 'grains' LIMIT 1), 'Organic Unpolished Toor Dal (Arhar Pulses)', 'organic-unpolished-toor-dal', 'Zero chemical polish to preserve rich natural dietary fiber, folic acid, and protein. Cooks into creamy aromatic dal.', ARRAY['https://images.unsplash.com/photo-1585992639927-435ba50567e9?auto=format&fit=crop&w=800&q=80']::TEXT[], 'WEIGHT', '1 kg', 175, 205, 125, 50, 0, 12, true, true, '[{"label":"1 kg pack","multiplier":1,"price":175},{"label":"2 kg pack","multiplier":2,"price":340}]'::JSONB, NOW(), NOW())
ON CONFLICT ("slug") DO UPDATE SET 
  "name" = EXCLUDED."name",
  "price" = EXCLUDED."price", 
  "images" = EXCLUDED."images",
  "stockQuantity" = EXCLUDED."stockQuantity",
  "isAvailable" = true,
  "isActive" = true;
INSERT INTO "Product" ("id", "categoryId", "name", "slug", "description", "images", "unitType", "defaultUnit", "price", "compareAtPrice", "costPrice", "stockQuantity", "reservedStock", "minStockThreshold", "isAvailable", "isActive", "variants", "createdAt", "updatedAt") VALUES
('prod-grocery-021', (SELECT "id" FROM "Category" WHERE "slug" = 'personal-care' OR "slug" = 'personal-care' LIMIT 1), 'Ayurvedic Neem & Aloe Gentle Foaming Handwash', 'neem-aloe-foaming-handwash', 'Natural antibacterial formula that protects hands from 99.9% germs while keeping skin soft, hydrated, and refreshed.', ARRAY['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80']::TEXT[], 'FIXED', '500 ml Pump Dispenser', 145, 180, 85, 25, 0, 5, true, true, NULL, NOW(), NOW())
ON CONFLICT ("slug") DO UPDATE SET 
  "name" = EXCLUDED."name",
  "price" = EXCLUDED."price", 
  "images" = EXCLUDED."images",
  "stockQuantity" = EXCLUDED."stockQuantity",
  "isAvailable" = true,
  "isActive" = true;
INSERT INTO "Product" ("id", "categoryId", "name", "slug", "description", "images", "unitType", "defaultUnit", "price", "compareAtPrice", "costPrice", "stockQuantity", "reservedStock", "minStockThreshold", "isAvailable", "isActive", "variants", "createdAt", "updatedAt") VALUES
('prod-grocery-022', (SELECT "id" FROM "Category" WHERE "slug" = 'household' OR "slug" = 'household' LIMIT 1), 'Plant-Based Citrus Floor Cleaner (Pet Safe)', 'plant-based-citrus-floor-cleaner', 'Tough on stains, completely non-toxic and child-safe. Infused with natural lemongrass and sweet orange essential oils.', ARRAY['https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=800&q=80']::TEXT[], 'FIXED', '1 Litre Bottle', 189, 225, 110, 30, 0, 6, true, true, NULL, NOW(), NOW())
ON CONFLICT ("slug") DO UPDATE SET 
  "name" = EXCLUDED."name",
  "price" = EXCLUDED."price", 
  "images" = EXCLUDED."images",
  "stockQuantity" = EXCLUDED."stockQuantity",
  "isAvailable" = true,
  "isActive" = true;
