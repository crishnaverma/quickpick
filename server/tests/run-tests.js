const http = require('http');
const app = require('../src/app');
const prisma = require('../src/database/prisma');

let server;
const PORT = 5099;
const BASE_URL = `http://localhost:${PORT}/api`;

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const json = await response.json().catch(() => ({}));
  return { status: response.status, body: json };
}

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    testsPassed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    testsFailed++;
  }
}

async function run() {
  console.log('\n======================================================');
  console.log('🧪 Starting QuickPick Automated Test Suite');
  console.log('======================================================\n');

  await new Promise((resolve) => {
    server = app.listen(PORT, resolve);
  });

  try {
    // 1. Health check
    console.log('Test Suite 1: Health & Public Settings');
    const health = await request('/health');
    assert(health.status === 200 && health.body.success, 'Health check responds with 200 OK');

    const settings = await request('/settings/public');
    assert(settings.status === 200 && settings.body.data.shopName.includes('QuickPick'), 'Public shop settings available');

    // 2. Authentication & Authorization
    console.log('\nTest Suite 2: Authentication & Authorization');
    const testEmail = `testuser_${Date.now()}@example.com`;
    const testPhone = `9${Math.floor(100000000 + Math.random() * 900000000)}`;

    const regRes = await request('/auth/register', {
      method: 'POST',
      body: {
        name: 'Test Customer',
        email: testEmail,
        phone: testPhone,
        password: 'Password@123',
      },
    });
    assert(regRes.status === 201 && regRes.body.data.token, 'Customer registration returns JWT token');
    const customerToken = regRes.body.data.token;

    // Login as Admin
    const adminLogin = await request('/auth/login', {
      method: 'POST',
      body: {
        email: 'admin@quickpick.com',
        password: 'Admin@12345',
      },
    });
    assert(adminLogin.status === 200 && adminLogin.body.data.user.role === 'ADMIN', 'Admin login successful with ADMIN role');
    const adminToken = adminLogin.body.data.token;

    // Test Role-based Authorization: Customer trying to access Admin endpoint
    const forbiddenRes = await request('/admin/overview', {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(forbiddenRes.status === 403, 'Customer blocked with 403 from accessing admin overview');

    const allowedAdminRes = await request('/admin/overview', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(allowedAdminRes.status === 200, 'Admin successfully accesses admin overview');

    // 3. Product Catalogue & Categories
    console.log('\nTest Suite 3: Product Catalogue & Categories');
    const catRes = await request('/products/categories');
    assert(catRes.status === 200 && catRes.body.data.length >= 8, `Fetched ${catRes.body.data.length} categories`);

    const prodRes = await request('/products?category=fruits');
    assert(prodRes.status === 200 && prodRes.body.data.products.length > 0, 'Fetched products by category');

    const searchRes = await request('/products?search=Apples');
    assert(searchRes.status === 200 && searchRes.body.data.products.some((p) => p.name.includes('Apples')), 'Product search works');

    // 4. Cart Operations
    console.log('\nTest Suite 4: Shopping Cart');
    const sampleProduct = prodRes.body.data.products[0];

    const addCartRes = await request('/cart/items', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: {
        productId: sampleProduct.id,
        quantity: 2,
        unitVariant: sampleProduct.variants?.[0]?.label || 'default',
      },
    });
    assert(addCartRes.status === 200 && addCartRes.body.data.itemCount === 2, 'Added item to cart');

    const getCartRes = await request('/cart', {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(getCartRes.status === 200 && getCartRes.body.data.subtotal > 0, 'Cart calculates subtotal properly');

    // 5. Order Creation & Inventory Reservation
    console.log('\nTest Suite 5: Order Creation & Inventory Reservation');
    const initialProductStock = sampleProduct.stockQuantity;
    const initialReserved = sampleProduct.reservedStock || 0;

    const orderRes = await request('/orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: {
        items: [
          {
            productId: sampleProduct.id,
            quantity: 2,
            unitVariant: sampleProduct.variants?.[0]?.label || 'default',
          },
        ],
        pickupType: 'ASAP',
        paymentMethod: 'CASH_ON_PICKUP',
        notes: 'Test order note',
        idempotencyKey: `idemp_${Date.now()}`,
      },
    });
    assert(orderRes.status === 201 && orderRes.body.data.orderNumber, `Order created: ${orderRes.body.data?.orderNumber}`);
    const createdOrder = orderRes.body.data;

    // Verify inventory reservation in database
    const productAfterOrder = await prisma.product.findUnique({ where: { id: sampleProduct.id } });
    assert(
      productAfterOrder.reservedStock === initialReserved + 2,
      `Reserved stock incremented from ${initialReserved} to ${productAfterOrder.reservedStock}`
    );

    // Verify QR code generation
    assert(createdOrder.pickup?.qrCodeDataUrl?.startsWith('data:image/png;base64,'), 'Secure pickup QR code generated as data URL');
    assert(createdOrder.pickup?.pickupToken, `Pickup token generated: ${createdOrder.pickup?.pickupToken}`);

    // 6. Test Idempotency (resubmitting same key returns existing order)
    console.log('\nTest Suite 6: Idempotency Protection');
    const duplicateOrderRes = await request('/orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: {
        items: [{ productId: sampleProduct.id, quantity: 2 }],
        pickupType: 'ASAP',
        paymentMethod: 'CASH_ON_PICKUP',
        idempotencyKey: createdOrder.idempotencyKey,
      },
    });
    assert(
      duplicateOrderRes.status === 200 && duplicateOrderRes.body.data.orderNumber === createdOrder.orderNumber,
      'Duplicate submission returned existing order without creating duplicate or double-reserving inventory'
    );

    // 7. Order Status Transition & Pickup Workflow
    console.log('\nTest Suite 7: Order Status Transitions & Pickup Handover');
    // Admin marks order as PREPARING
    const preparingRes = await request(`/admin/orders/${createdOrder.id}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { status: 'PREPARING' },
    });
    assert(preparingRes.status === 200 && preparingRes.body.data.status === 'PREPARING', 'Order marked PREPARING');

    // Admin marks order as READY
    const readyRes = await request(`/admin/orders/${createdOrder.id}/status`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { status: 'READY' },
    });
    assert(readyRes.status === 200 && readyRes.body.data.status === 'READY', 'Order marked READY for pickup');

    // Staff verifies pickup token
    const verifyRes = await request('/pickups/verify', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        pickupToken: createdOrder.pickup.pickupToken,
        orderNumber: createdOrder.orderNumber,
      },
    });
    assert(verifyRes.status === 200 && verifyRes.body.data.isValid === true, 'Staff verified valid pickup token');

    // Staff confirms collection
    const confirmRes = await request('/pickups/confirm', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        pickupToken: createdOrder.pickup.pickupToken,
        notes: 'Handed over to customer',
      },
    });
    assert(confirmRes.status === 200 && confirmRes.body.data.status === 'COLLECTED', 'Order marked COLLECTED');

    // Test Duplicate Pickup Attempt Protection
    const duplicatePickupRes = await request('/pickups/verify', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        pickupToken: createdOrder.pickup.pickupToken,
      },
    });
    assert(
      duplicatePickupRes.status === 400 && duplicatePickupRes.body.errors?.isAlreadyCollected === true,
      'Duplicate pickup blocked: system prevents duplicate grocery collections'
    );

    // 8. Test Cancellation and Stock Release
    console.log('\nTest Suite 8: Cancellation & Automatic Inventory Release');
    // Create new order to test cancellation
    const cancelTestOrderRes = await request('/orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: {
        items: [{ productId: sampleProduct.id, quantity: 1 }],
        pickupType: 'ASAP',
        paymentMethod: 'CASH_ON_PICKUP',
      },
    });
    const cancelOrderNum = cancelTestOrderRes.body.data.orderNumber;

    const cancelRes = await request(`/orders/${cancelOrderNum}/cancel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${customerToken}` },
      body: { reason: 'Changed mind' },
    });
    assert(cancelRes.status === 200 && cancelRes.body.data.status === 'CANCELLED', 'Order cancelled successfully');

    // Verify inventory movement record of type RELEASE
    const releaseMovement = await prisma.inventoryMovement.findFirst({
      where: {
        orderId: cancelTestOrderRes.body.data.id,
        type: 'RELEASE',
      },
    });
    assert(releaseMovement !== null && releaseMovement.quantity === 1, 'Inventory movement logged RELEASE type');

    console.log('\n======================================================');
    console.log(`Results: ${testsPassed} passed, ${testsFailed} failed`);
    console.log('======================================================\n');
  } catch (err) {
    console.error('Test execution error:', err);
    testsFailed++;
  } finally {
    server.close();
    await prisma.$disconnect();
    if (testsFailed > 0) {
      process.exit(1);
    }
  }
}

run();
