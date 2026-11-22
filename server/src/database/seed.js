const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding QuickPick Database...');

  // 1. Clean existing data in reverse order of foreign keys
  try {
    await prisma.auditLog.deleteMany({});
    await prisma.inventoryMovement.deleteMany({});
    await prisma.pickup.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.cartItem.deleteMany({});
    await prisma.cart.deleteMany({});
    await prisma.address.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.pickupSlot.deleteMany({});
    await prisma.shopSettings.deleteMany({});
    await prisma.user.deleteMany({});
  } catch (err) {
    console.log('Note during cleanup (may be initial setup):', err.message);
  }

  // 2. Hash default passwords
  const adminPassword = await bcrypt.hash('Admin@12345', 10);
  const staffPassword = await bcrypt.hash('Staff@12345', 10);
  const customerPassword = await bcrypt.hash('Customer@12345', 10);

  // 3. Create Users
  const adminUser = await prisma.user.create({
    data: {
      name: 'Priya Sharma (Store Manager)',
      email: 'admin@quickpick.com',
      phone: '+91 98765 00001',
      passwordHash: adminPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });

  const staffUser = await prisma.user.create({
    data: {
      name: 'Rohan Mehta (Pickup Associate)',
      email: 'staff@quickpick.com',
      phone: '+91 98765 00002',
      passwordHash: staffPassword,
      role: 'STAFF',
      isActive: true,
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      name: 'Ananya Verma',
      email: 'customer@example.com',
      phone: '+91 98765 43210',
      passwordHash: customerPassword,
      role: 'CUSTOMER',
      isActive: true,
      addresses: {
        create: [
          {
            label: 'Home',
            street: 'Flat 402, Sai Residency, 4th Cross',
            city: 'Bangalore',
            postalCode: '560103',
            landmark: 'Near Green Glen Park',
            isDefault: true,
          },
        ],
      },
    },
  });

  console.log('✅ Users created: Admin, Staff, Customer');

  // 4. Shop Settings
  const shopSettings = await prisma.shopSettings.create({
    data: {
      id: 'shop-settings-primary',
      shopName: 'QuickPick Fresh Market',
      tagline: 'Farm-Fresh Groceries, Swift Click & Collect',
      phone: '+91 98765 43210',
      email: 'hello@quickpickmarket.com',
      address: 'Shop #4, Green Glen Plaza, 100 Feet Road, Bangalore, KA 560103',
      openingTime: '07:00',
      closingTime: '22:00',
      slotDurationMinutes: 30,
      maxOrdersPerSlot: 10,
      isShopOpen: true,
      acceptAsap: true,
      taxRate: 0.05,
      currency: 'INR',
      minOrderAmount: 99.00,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_quickpick2026',
    },
  });
  console.log('✅ Shop Settings configured');

  // 5. Categories
  const categoriesData = [
    {
      name: 'Fruits',
      slug: 'fruits',
      description: 'Handpicked fresh, sweet, and seasonal orchard fruits',
      image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=600&q=80',
      displayOrder: 1,
    },
    {
      name: 'Vegetables',
      slug: 'vegetables',
      description: 'Farm-fresh daily harvest crisp greens and cooking essentials',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
      displayOrder: 2,
    },
    {
      name: 'Dairy & Eggs',
      slug: 'dairy',
      description: 'Pure milk, artisanal paneer, butter, curd, and farm eggs',
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
      displayOrder: 3,
    },
    {
      name: 'Bakery & Bread',
      slug: 'bakery',
      description: 'Freshly baked artisan loaves, buns, croissants, and snacks',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
      displayOrder: 4,
    },
    {
      name: 'Beverages',
      slug: 'beverages',
      description: 'Cold pressed juices, craft teas, filter coffee and coolers',
      image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
      displayOrder: 5,
    },
    {
      name: 'Snacks & Munchies',
      slug: 'snacks',
      description: 'Roasted dry fruits, gourmet crisps, savory namkeens',
      image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=600&q=80',
      displayOrder: 6,
    },
    {
      name: 'Rice, Atta & Grains',
      slug: 'rice-grains',
      description: 'Premium aromatic basmati, chakki fresh flour, lentils and pulses',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
      displayOrder: 7,
    },
    {
      name: 'Personal Care',
      slug: 'personal-care',
      description: 'Natural soaps, gentle shampoos, oral care, and skin essentials',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
      displayOrder: 8,
    },
    {
      name: 'Household Cleaning',
      slug: 'household',
      description: 'Eco surface cleaners, dish wash liquids, and kitchen rolls',
      image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=600&q=80',
      displayOrder: 9,
    },
  ];

  const categoryMap = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categoryMap[cat.slug] = created.id;
  }
  console.log(`✅ ${categoriesData.length} Categories created`);

  // 6. Products with realistic images, units, weight variants, pricing, and stock
  const isPg = Boolean(process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('file:'));
  const toImg = (arr) => isPg ? arr : JSON.stringify(arr);
  const toVar = (val) => (val === null ? null : (isPg ? val : JSON.stringify(val)));

  const productsData = [
    // Fruits
    {
      categoryId: categoryMap['fruits'],
      name: 'Royal Gala Crisp Apples (Shimla Fresh)',
      slug: 'royal-gala-apples',
      description: 'Crisp, sweet, and juicy red apples sourced directly from Himachal orchards. Rich in dietary fiber and antioxidants.',
      images: toImg([
        'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=800&q=80',
      ]),
      unitType: 'WEIGHT',
      defaultUnit: '1 kg',
      price: 180.00,
      compareAtPrice: 220.00,
      costPrice: 130.00,
      stockQuantity: 45,
      reservedStock: 0,
      minStockThreshold: 10,
      isAvailable: true,
      isActive: true,
      variants: toVar([
        { label: '500g', multiplier: 0.5, price: 95.00 },
        { label: '1 kg', multiplier: 1.0, price: 180.00 },
        { label: '2 kg', multiplier: 2.0, price: 345.00 },
      ]),
    },
    {
      categoryId: categoryMap['fruits'],
      name: 'Organic Robusta Bananas',
      slug: 'organic-robusta-bananas',
      description: 'Naturally ripened, rich in potassium and energy. Perfect for breakfast smoothies and quick healthy snacking.',
      images: toImg([
        'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=800&q=80',
      ]),
      unitType: 'WEIGHT',
      defaultUnit: '1 kg',
      price: 60.00,
      compareAtPrice: 75.00,
      costPrice: 38.00,
      stockQuantity: 60,
      reservedStock: 0,
      minStockThreshold: 15,
      isAvailable: true,
      isActive: true,
      variants: toVar([
        { label: '500g (~3-4 pcs)', multiplier: 0.5, price: 32.00 },
        { label: '1 kg (~6-8 pcs)', multiplier: 1.0, price: 60.00 },
      ]),
    },
    {
      categoryId: categoryMap['fruits'],
      name: 'Alphonso Mangoes (Devgad Reserve)',
      slug: 'alphonso-mangoes',
      description: 'The King of Mangoes! Distinct saffron pulp, rich aromatic sweetness, and buttery texture. GI-tagged authentic produce.',
      images: toImg([
        'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80',
      ]),
      unitType: 'FIXED',
      defaultUnit: 'Box of 6 pcs',
      price: 499.00,
      compareAtPrice: 599.00,
      costPrice: 360.00,
      stockQuantity: 18,
      reservedStock: 0,
      minStockThreshold: 5,
      isAvailable: true,
      isActive: true,
      variants: null,
    },
    {
      categoryId: categoryMap['fruits'],
      name: 'Sweet Ruby Pomegranate (Kesar)',
      slug: 'ruby-pomegranate',
      description: 'Deep ruby-red arils bursting with sweet, refreshing juice. Carefully graded for high sweetness and soft seeds.',
      images: toImg([
        'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=800&q=80',
      ]),
      unitType: 'WEIGHT',
      defaultUnit: '1 kg',
      price: 210.00,
      compareAtPrice: 260.00,
      costPrice: 150.00,
      stockQuantity: 28,
      reservedStock: 0,
      minStockThreshold: 8,
      isAvailable: true,
      isActive: true,
      variants: toVar([
        { label: '500g (~2 pcs)', multiplier: 0.5, price: 110.00 },
        { label: '1 kg (~4 pcs)', multiplier: 1.0, price: 210.00 },
      ]),
    },

    // Vegetables
    {
      categoryId: categoryMap['vegetables'],
      name: 'Vine-Ripened Country Tomatoes',
      slug: 'vine-ripened-tomatoes',
      description: 'Plump, tangy, farm-fresh local tomatoes. Ideal for curries, rasam, salads, and fresh salsa.',
      images: toImg([
        'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
      ]),
      unitType: 'WEIGHT',
      defaultUnit: '1 kg',
      price: 45.00,
      compareAtPrice: 55.00,
      costPrice: 28.00,
      stockQuantity: 80,
      reservedStock: 0,
      minStockThreshold: 20,
      isAvailable: true,
      isActive: true,
      variants: toVar([
        { label: '500g', multiplier: 0.5, price: 24.00 },
        { label: '1 kg', multiplier: 1.0, price: 45.00 },
        { label: '2 kg', multiplier: 2.0, price: 86.00 },
      ]),
    },
    {
      categoryId: categoryMap['vegetables'],
      name: 'Nashik Red Onions (Premium Grade)',
      slug: 'nashik-red-onions',
      description: 'Firm, dry-skinned, pungent red onions. Essential kitchen staple with long shelf life and punchy flavor.',
      images: toImg([
        'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=800&q=80',
      ]),
      unitType: 'WEIGHT',
      defaultUnit: '1 kg',
      price: 52.00,
      compareAtPrice: 65.00,
      costPrice: 35.00,
      stockQuantity: 120,
      reservedStock: 0,
      minStockThreshold: 25,
      isAvailable: true,
      isActive: true,
      variants: toVar([
        { label: '1 kg', multiplier: 1.0, price: 52.00 },
        { label: '2 kg', multiplier: 2.0, price: 98.00 },
        { label: '5 kg (Saver Pack)', multiplier: 5.0, price: 235.00 },
      ]),
    },
    {
      categoryId: categoryMap['vegetables'],
      name: 'Golden Baby Potatoes',
      slug: 'golden-baby-potatoes',
      description: 'Tender baby potatoes with thin skins. Ideal for Dum Aloo, roasts, boiling, and crispy wedges.',
      images: toImg([
        'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80',
      ]),
      unitType: 'WEIGHT',
      defaultUnit: '1 kg',
      price: 40.00,
      compareAtPrice: 50.00,
      costPrice: 25.00,
      stockQuantity: 90,
      reservedStock: 0,
      minStockThreshold: 20,
      isAvailable: true,
      isActive: true,
      variants: toVar([
        { label: '1 kg', multiplier: 1.0, price: 40.00 },
        { label: '2 kg', multiplier: 2.0, price: 76.00 },
      ]),
    },
    {
      categoryId: categoryMap['vegetables'],
      name: 'Crisp English Cucumbers',
      slug: 'crisp-english-cucumbers',
      description: 'Seedless, thin-skinned and extra hydrating. Excellent for raita, cooling summer salads and detox water.',
      images: toImg([
        'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=800&q=80',
      ]),
      unitType: 'WEIGHT',
      defaultUnit: '500g',
      price: 35.00,
      compareAtPrice: 45.00,
      costPrice: 20.00,
      stockQuantity: 35,
      reservedStock: 0,
      minStockThreshold: 10,
      isAvailable: true,
      isActive: true,
      variants: toVar([
        { label: '500g (~2 pcs)', multiplier: 0.5, price: 35.00 },
        { label: '1 kg (~4 pcs)', multiplier: 1.0, price: 65.00 },
      ]),
    },
    {
      categoryId: categoryMap['vegetables'],
      name: 'Hydroponic Tender Spinach (Palak)',
      slug: 'tender-spinach-palak',
      description: 'Washed, soil-free tender baby spinach leaves. High iron, vitamin K and fresh earthy aroma.',
      images: toImg([
        'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80',
      ]),
      unitType: 'FIXED',
      defaultUnit: 'Pack of 2 bunches (250g)',
      price: 38.00,
      compareAtPrice: 50.00,
      costPrice: 22.00,
      stockQuantity: 24,
      reservedStock: 0,
      minStockThreshold: 6,
      isAvailable: true,
      isActive: true,
      variants: null,
    },

    // Dairy & Eggs
    {
      categoryId: categoryMap['dairy'],
      name: 'Farm-Fresh Pasteurized Whole Milk (3.5% Fat)',
      slug: 'farm-fresh-whole-milk',
      description: 'Pure, rich whole milk delivered cold daily from local dairy farms. No preservatives or adulterants.',
      images: toImg([
        'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=800&q=80',
      ]),
      unitType: 'FIXED',
      defaultUnit: '1 Litre Pouch',
      price: 68.00,
      compareAtPrice: 72.00,
      costPrice: 55.00,
      stockQuantity: 50,
      reservedStock: 0,
      minStockThreshold: 15,
      isAvailable: true,
      isActive: true,
      variants: null,
    },
    {
      categoryId: categoryMap['dairy'],
      name: 'Artisanal Malai Paneer (Fresh Cottage Cheese)',
      slug: 'artisanal-malai-paneer',
      description: 'Melt-in-mouth soft paneer made from pure cow milk. High protein, velvety texture, ideal for shahi paneer and tikka.',
      images: toImg([
        'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80',
      ]),
      unitType: 'WEIGHT',
      defaultUnit: '200g',
      price: 105.00,
      compareAtPrice: 120.00,
      costPrice: 78.00,
      stockQuantity: 30,
      reservedStock: 0,
      minStockThreshold: 8,
      isAvailable: true,
      isActive: true,
      variants: toVar([
        { label: '200g block', multiplier: 1.0, price: 105.00 },
        { label: '400g block (Value Pack)', multiplier: 2.0, price: 198.00 },
      ]),
    },
    {
      categoryId: categoryMap['dairy'],
      name: 'Free-Range Organic Brown Eggs',
      slug: 'free-range-brown-eggs',
      description: 'Farm-fresh nutritious brown eggs from pasture-raised hens fed organic grains and herbs.',
      images: toImg([
        'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?auto=format&fit=crop&w=800&q=80',
      ]),
      unitType: 'FIXED',
      defaultUnit: 'Pack of 12 eggs',
      price: 135.00,
      compareAtPrice: 160.00,
      costPrice: 95.00,
      stockQuantity: 40,
      reservedStock: 0,
      minStockThreshold: 10,
      isAvailable: true,
      isActive: true,
      variants: null,
    },
    {
      categoryId: categoryMap['dairy'],
      name: 'A2 Vedic Desi Cow Bilona Ghee',
      slug: 'a2-desi-cow-bilona-ghee',
      description: 'Traditional slow-cooked bilona ghee from grass-fed Gir cows. Rich aroma, golden granulations, Ayurvedic digestive benefits.',
      images: toImg([
        'https://images.unsplash.com/photo-1631452180677-7429188e7343?auto=format&fit=crop&w=800&q=80',
      ]),
      unitType: 'FIXED',
      defaultUnit: '500 ml Glass Jar',
      price: 699.00,
      compareAtPrice: 850.00,
      costPrice: 480.00,
      stockQuantity: 15,
      reservedStock: 0,
      minStockThreshold: 4,
      isAvailable: true,
      isActive: true,
      variants: null,
    },

    // Bakery
    {
      categoryId: categoryMap['bakery'],
      name: 'Artisan Whole Wheat Sourdough Loaf',
      slug: 'whole-wheat-sourdough-loaf',
      description: 'Naturally fermented for 24 hours with wild yeast culture. Crisp crackly crust, open crumb, and wholesome gut-friendly tang.',
      images: toImg([
        'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80',
      ]),
      unitType: 'FIXED',
      defaultUnit: '400g Loaf (Sliced)',
      price: 110.00,
      compareAtPrice: 135.00,
      costPrice: 70.00,
      stockQuantity: 22,
      reservedStock: 0,
      minStockThreshold: 5,
      isAvailable: true,
      isActive: true,
      variants: null,
    },
    {
      categoryId: categoryMap['bakery'],
      name: 'Fresh Mumbai Pav Buns (Zero Maida)',
      slug: 'fresh-mumbai-pav-buns',
      description: 'Fluffy, cloud-soft whole wheat dinner rolls. Made fresh every morning, perfect companion for Misal and Bhaji.',
      images: toImg([
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
      ]),
      unitType: 'FIXED',
      defaultUnit: 'Pack of 6 pcs',
      price: 45.00,
      compareAtPrice: 55.00,
      costPrice: 26.00,
      stockQuantity: 35,
      reservedStock: 0,
      minStockThreshold: 8,
      isAvailable: true,
      isActive: true,
      variants: null,
    },

    // Beverages
    {
      categoryId: categoryMap['beverages'],
      name: 'Raw Cold-Pressed Valencia Orange Juice',
      slug: 'raw-valencia-orange-juice',
      description: '100% pure Valencia oranges cold-pressed with zero added sugar, water or preservatives. Vitamin C booster.',
      images: toImg([
        'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80',
      ]),
      unitType: 'FIXED',
      defaultUnit: '1 Litre Bottle',
      price: 165.00,
      compareAtPrice: 195.00,
      costPrice: 115.00,
      stockQuantity: 20,
      reservedStock: 0,
      minStockThreshold: 6,
      isAvailable: true,
      isActive: true,
      variants: null,
    },
    {
      categoryId: categoryMap['beverages'],
      name: 'Authentic South Indian Degree Filter Coffee Powder',
      slug: 'south-indian-filter-coffee',
      description: 'Chikmagalur Arabica-Robusta blend roasted to dark perfection with 15% chicory for thick golden decoction.',
      images: toImg([
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
      ]),
      unitType: 'WEIGHT',
      defaultUnit: '250g',
      price: 175.00,
      compareAtPrice: 210.00,
      costPrice: 110.00,
      stockQuantity: 40,
      reservedStock: 0,
      minStockThreshold: 8,
      isAvailable: true,
      isActive: true,
      variants: toVar([
        { label: '250g pouch', multiplier: 1.0, price: 175.00 },
        { label: '500g pouch (Saver)', multiplier: 2.0, price: 330.00 },
      ]),
    },

    // Snacks
    {
      categoryId: categoryMap['snacks'],
      name: 'California Jumbo Almonds (Badam) - Slow Roasted',
      slug: 'california-jumbo-almonds',
      description: 'Crisp, crunchy California Nonpareil almonds slow-roasted with Himalayan pink salt. High in vitamin E and healthy fats.',
      images: toImg([
        'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=800&q=80',
      ]),
      unitType: 'WEIGHT',
      defaultUnit: '250g',
      price: 280.00,
      compareAtPrice: 340.00,
      costPrice: 190.00,
      stockQuantity: 32,
      reservedStock: 0,
      minStockThreshold: 8,
      isAvailable: true,
      isActive: true,
      variants: toVar([
        { label: '250g pouch', multiplier: 1.0, price: 280.00 },
        { label: '500g pouch', multiplier: 2.0, price: 540.00 },
      ]),
    },

    // Rice & Grains
    {
      categoryId: categoryMap['rice-grains'],
      name: 'Royal Aged Kohinoor Basmati Rice (2 Years Aged)',
      slug: 'royal-aged-basmati-rice',
      description: 'Extra long slender grains that elongate up to 2.5x upon cooking with enchanting royal aroma. Perfect for biryani & pulao.',
      images: toImg([
        'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
      ]),
      unitType: 'WEIGHT',
      defaultUnit: '1 kg',
      price: 195.00,
      compareAtPrice: 240.00,
      costPrice: 140.00,
      stockQuantity: 65,
      reservedStock: 0,
      minStockThreshold: 15,
      isAvailable: true,
      isActive: true,
      variants: toVar([
        { label: '1 kg pack', multiplier: 1.0, price: 195.00 },
        { label: '5 kg bag (Value)', multiplier: 5.0, price: 899.00 },
      ]),
    },
    {
      categoryId: categoryMap['rice-grains'],
      name: 'Organic Unpolished Toor Dal (Arhar Pulses)',
      slug: 'organic-unpolished-toor-dal',
      description: 'Zero chemical polish to preserve rich natural dietary fiber, folic acid, and protein. Cooks into creamy aromatic dal.',
      images: toImg([
        'https://images.unsplash.com/photo-1585992639927-435ba50567e9?auto=format&fit=crop&w=800&q=80',
      ]),
      unitType: 'WEIGHT',
      defaultUnit: '1 kg',
      price: 175.00,
      compareAtPrice: 205.00,
      costPrice: 125.00,
      stockQuantity: 50,
      reservedStock: 0,
      minStockThreshold: 12,
      isAvailable: true,
      isActive: true,
      variants: toVar([
        { label: '1 kg pack', multiplier: 1.0, price: 175.00 },
        { label: '2 kg pack', multiplier: 2.0, price: 340.00 },
      ]),
    },

    // Personal Care
    {
      categoryId: categoryMap['personal-care'],
      name: 'Ayurvedic Neem & Aloe Gentle Foaming Handwash',
      slug: 'neem-aloe-foaming-handwash',
      description: 'Natural antibacterial formula that protects hands from 99.9% germs while keeping skin soft, hydrated, and refreshed.',
      images: toImg([
        'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
      ]),
      unitType: 'FIXED',
      defaultUnit: '500 ml Pump Dispenser',
      price: 145.00,
      compareAtPrice: 180.00,
      costPrice: 85.00,
      stockQuantity: 25,
      reservedStock: 0,
      minStockThreshold: 5,
      isAvailable: true,
      isActive: true,
      variants: null,
    },

    // Household
    {
      categoryId: categoryMap['household'],
      name: 'Plant-Based Citrus Floor Cleaner (Pet Safe)',
      slug: 'plant-based-citrus-floor-cleaner',
      description: 'Tough on stains, completely non-toxic and child-safe. Infused with natural lemongrass and sweet orange essential oils.',
      images: toImg([
        'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=800&q=80',
      ]),
      unitType: 'FIXED',
      defaultUnit: '1 Litre Bottle',
      price: 189.00,
      compareAtPrice: 225.00,
      costPrice: 110.00,
      stockQuantity: 30,
      reservedStock: 0,
      minStockThreshold: 6,
      isAvailable: true,
      isActive: true,
      variants: null,
    },
  ];

  const createdProducts = [];
  for (const prod of productsData) {
    const created = await prisma.product.create({ data: prod });
    createdProducts.push(created);

    // Initial stock-in inventory movement
    await prisma.inventoryMovement.create({
      data: {
        productId: created.id,
        type: 'STOCK_IN',
        quantity: created.stockQuantity,
        balanceAfter: created.stockQuantity,
        notes: 'Initial warehouse inventory stock load',
        createdByStaffId: adminUser.id,
      },
    });
  }
  console.log(`✅ ${createdProducts.length} Grocery Products & Stock records created`);

  // 7. Generate Pickup Slots for Today and Tomorrow (30 min slots)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const timeSlots = [
    { start: '08:00', end: '08:30' },
    { start: '08:30', end: '09:00' },
    { start: '09:00', end: '09:30' },
    { start: '09:30', end: '10:00' },
    { start: '10:00', end: '10:30' },
    { start: '10:30', end: '11:00' },
    { start: '11:00', end: '11:30' },
    { start: '11:30', end: '12:00' },
    { start: '12:00', end: '12:30' },
    { start: '14:00', end: '14:30' },
    { start: '14:30', end: '15:00' },
    { start: '15:00', end: '15:30' },
    { start: '15:30', end: '16:00' },
    { start: '16:00', end: '16:30' },
    { start: '16:30', end: '17:00' },
    { start: '17:00', end: '17:30' },
    { start: '17:30', end: '18:00' },
    { start: '18:00', end: '18:30' },
    { start: '18:30', end: '19:00' },
    { start: '19:00', end: '19:30' },
    { start: '19:30', end: '20:00' },
    { start: '20:00', end: '20:30' },
  ];

  const createdSlots = [];
  for (const date of [today, tomorrow]) {
    for (const slot of timeSlots) {
      const createdSlot = await prisma.pickupSlot.create({
        data: {
          date: date,
          startTime: slot.start,
          endTime: slot.end,
          maxOrders: 10,
          bookedCount: 0,
          isClosed: false,
        },
      });
      createdSlots.push(createdSlot);
    }
  }
  console.log(`✅ ${createdSlots.length} Pickup Time Slots generated (Today & Tomorrow)`);

  // 8. Seed sample orders representing different workflow stages (PLACED, PREPARING, READY, COLLECTED)
  const qrcode = require('qrcode');
  const crypto = require('crypto');

  // Helper to make sample order
  async function createSampleOrder({ orderNum, status, pickupType, slot, items, paymentMethod, paymentStatus, isCollected = false }) {
    let subtotal = 0;
    const orderItemsData = items.map((it) => {
      const itemTotal = it.price * it.qty;
      subtotal += itemTotal;
      return {
        productId: it.product.id,
        productName: it.product.name,
        productUnit: it.product.defaultUnit,
        unitVariant: it.variant || 'default',
        quantity: it.qty,
        unitPrice: it.price,
        totalPrice: itemTotal,
      };
    });

    const taxTotal = Math.round(subtotal * 0.05 * 100) / 100;
    const totalAmount = subtotal + taxTotal;
    const pickupToken = crypto.randomBytes(8).toString('hex').toUpperCase();

    // Generate QR payload containing verification token
    const qrPayload = JSON.stringify({
      orderNumber: orderNum,
      token: pickupToken,
      shop: 'QuickPick',
      v: 1,
    });
    const qrCodeDataUrl = await qrcode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 280,
      color: {
        dark: '#14532d', // Brand deep green
        light: '#ffffff',
      },
    });

    const order = await prisma.order.create({
      data: {
        orderNumber: orderNum,
        userId: customerUser.id,
        pickupSlotId: slot ? slot.id : null,
        status: status,
        pickupType: pickupType,
        estimatedPickupTime: new Date(Date.now() + 25 * 60 * 1000), // 25 mins from now
        subtotal: subtotal,
        taxTotal: taxTotal,
        discountTotal: 0,
        totalAmount: totalAmount,
        notes: 'Please pack fruits carefully.',
        items: {
          create: orderItemsData,
        },
        payment: {
          create: {
            method: paymentMethod,
            status: paymentStatus,
            amount: totalAmount,
            currency: 'INR',
            razorpayOrderId: paymentMethod === 'RAZORPAY' ? `order_mock_${crypto.randomBytes(4).toString('hex')}` : null,
            razorpayPaymentId: paymentStatus === 'SUCCESS' ? `pay_mock_${crypto.randomBytes(6).toString('hex')}` : null,
          },
        },
        pickup: {
          create: {
            pickupToken: pickupToken,
            qrCodeDataUrl: qrCodeDataUrl,
            status: isCollected ? 'COLLECTED' : status === 'READY' ? 'READY' : 'PENDING',
            scheduledSlot: slot ? `${slot.startTime} - ${slot.endTime}` : 'ASAP (Est. 15-20 min)',
            readyAt: status === 'READY' || isCollected ? new Date() : null,
            collectedAt: isCollected ? new Date() : null,
            collectedByStaffId: isCollected ? staffUser.id : null,
          },
        },
      },
    });

    return order;
  }

  // Sample Order 1: READY for pickup (with live QR code!)
  const order1 = await createSampleOrder({
    orderNum: 'QP-20261121-001',
    status: 'READY',
    pickupType: 'ASAP',
    slot: null,
    items: [
      { product: createdProducts[0], qty: 1, price: 180.00, variant: '1 kg' },
      { product: createdProducts[4], qty: 2, price: 45.00, variant: '1 kg' },
      { product: createdProducts[9], qty: 1, price: 68.00, variant: 'default' },
    ],
    paymentMethod: 'RAZORPAY',
    paymentStatus: 'SUCCESS',
  });

  // Sample Order 2: PREPARING (scheduled slot)
  const order2 = await createSampleOrder({
    orderNum: 'QP-20261121-002',
    status: 'PREPARING',
    pickupType: 'SCHEDULED',
    slot: createdSlots[2],
    items: [
      { product: createdProducts[1], qty: 1, price: 60.00, variant: '1 kg' },
      { product: createdProducts[10], qty: 1, price: 105.00, variant: '200g block' },
      { product: createdProducts[13], qty: 1, price: 110.00, variant: 'default' },
    ],
    paymentMethod: 'CASH_ON_PICKUP',
    paymentStatus: 'PENDING',
  });

  // Sample Order 3: PLACED (incoming new order for staff to accept)
  const order3 = await createSampleOrder({
    orderNum: 'QP-20261121-003',
    status: 'PLACED',
    pickupType: 'ASAP',
    slot: null,
    items: [
      { product: createdProducts[15], qty: 1, price: 165.00, variant: 'default' },
      { product: createdProducts[17], qty: 1, price: 280.00, variant: '250g pouch' },
    ],
    paymentMethod: 'RAZORPAY',
    paymentStatus: 'SUCCESS',
  });

  // Sample Order 4: COLLECTED (historic completed order)
  const order4 = await createSampleOrder({
    orderNum: 'QP-20261120-098',
    status: 'COLLECTED',
    pickupType: 'SCHEDULED',
    slot: createdSlots[0],
    items: [
      { product: createdProducts[18], qty: 1, price: 195.00, variant: '1 kg pack' },
      { product: createdProducts[19], qty: 1, price: 175.00, variant: '1 kg pack' },
    ],
    paymentMethod: 'RAZORPAY',
    paymentStatus: 'SUCCESS',
    isCollected: true,
  });

  console.log('✅ 4 Sample Realistic Orders created (READY with QR, PREPARING, PLACED, COLLECTED)');

  console.log('\n======================================================');
  console.log('🌟 QuickPick Database Seed Finished Successfully!');
  console.log('Admin Account:    admin@quickpick.com / Admin@12345');
  console.log('Staff Account:    staff@quickpick.com / Staff@12345');
  console.log('Customer Account: customer@example.com / Customer@12345');
  console.log('======================================================\n');
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error('Seed error:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { seedDatabase: main };
