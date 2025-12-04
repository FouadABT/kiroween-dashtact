import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// Product images from Unsplash (free to use)
const IMAGES = {
  electronics: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800',
  ],
  clothing: [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
    'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
    'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800',
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
  ],
  accessories: [
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800',
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
    'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800',
  ],
  home: [
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
    'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800',
    'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800',
  ],
  sports: [
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
    'https://images.unsplash.com/photo-1519505907962-0a6cb0167c73?w=800',
    'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800',
  ],
};

async function main() {
  console.log('🌱 Starting ecommerce seed...\n');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.inventoryAdjustment.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.productTag.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.shippingMethod.deleteMany();
  console.log('✅ Cleared\n');

  // 1. Shipping Methods
  console.log('📦 Shipping methods...');
  const shipping = await Promise.all([
    prisma.shippingMethod.create({ data: { name: 'Standard', description: '5-7 days', price: 5.99, isActive: true } }),
    prisma.shippingMethod.create({ data: { name: 'Express', description: '2-3 days', price: 15.99, isActive: true } }),
    prisma.shippingMethod.create({ data: { name: 'Next Day', description: '1 day', price: 29.99, isActive: true } }),
    prisma.shippingMethod.create({ data: { name: 'Free', description: 'Orders $50+', price: 0, isActive: true } }),
  ]);
  console.log(`✅ ${shipping.length} methods\n`);

  // 2. Categories
  console.log('📂 Categories...');
  const cats = await Promise.all([
    prisma.productCategory.create({ data: { name: 'Electronics', slug: 'electronics', description: 'Gadgets & devices', displayOrder: 1, isVisible: true, image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400' } }),
    prisma.productCategory.create({ data: { name: 'Clothing', slug: 'clothing', description: 'Fashion & apparel', displayOrder: 2, isVisible: true, image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400' } }),
    prisma.productCategory.create({ data: { name: 'Accessories', slug: 'accessories', description: 'Bags, wallets & more', displayOrder: 3, isVisible: true, image: 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=400' } }),
    prisma.productCategory.create({ data: { name: 'Home', slug: 'home', description: 'Furniture & decor', displayOrder: 4, isVisible: true, image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400' } }),
    prisma.productCategory.create({ data: { name: 'Sports', slug: 'sports', description: 'Active lifestyle', displayOrder: 5, isVisible: true, image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400' } }),
  ]);
  console.log(`✅ ${cats.length} categories\n`);

  // 3. Tags
  console.log('🏷️  Tags...');
  const tags = await Promise.all([
    prisma.productTag.create({ data: { name: 'New', slug: 'new' } }),
    prisma.productTag.create({ data: { name: 'Sale', slug: 'sale' } }),
    prisma.productTag.create({ data: { name: 'Premium', slug: 'premium' } }),
    prisma.productTag.create({ data: { name: 'Eco', slug: 'eco' } }),
  ]);
  console.log(`✅ ${tags.length} tags\n`);

  // 4. Products
  console.log('🛍️  Products...');
  const products: any[] = [];
  
  const productData = [
    { name: 'Wireless Headphones', cat: 0, img: 'electronics', price: 299.99, compare: 399.99, desc: 'Premium noise-cancelling headphones', tags: [0, 2] },
    { name: 'Smart Watch Pro', cat: 0, img: 'electronics', price: 399.99, compare: 499.99, desc: 'Advanced health tracking', tags: [0, 2] },
    { name: 'Professional Camera', cat: 0, img: 'electronics', price: 1299.99, desc: 'Complete camera kit', tags: [2] },
    { name: 'Cotton T-Shirt', cat: 1, img: 'clothing', price: 29.99, compare: 39.99, desc: '100% organic cotton', tags: [3] },
    { name: 'Designer Jeans', cat: 1, img: 'clothing', price: 89.99, compare: 129.99, desc: 'Premium denim', tags: [1] },
    { name: 'Winter Jacket', cat: 1, img: 'clothing', price: 149.99, desc: 'Warm & stylish', tags: [0] },
    { name: 'Leather Backpack', cat: 2, img: 'accessories', price: 129.99, desc: 'Genuine leather', tags: [2] },
    { name: 'Designer Sunglasses', cat: 2, img: 'accessories', price: 199.99, compare: 299.99, desc: 'UV protection', tags: [1, 2] },
    { name: 'Table Lamp', cat: 3, img: 'home', price: 79.99, desc: 'Modern design', tags: [0] },
    { name: 'Throw Pillows', cat: 3, img: 'home', price: 49.99, desc: 'Set of 2', tags: [3] },
    { name: 'Yoga Mat', cat: 4, img: 'sports', price: 59.99, desc: 'Non-slip premium mat', tags: [3] },
    { name: 'Running Shoes', cat: 4, img: 'sports', price: 129.99, desc: 'Professional cushioning', tags: [0] },
  ];

  for (const pd of productData) {
    const imgs = IMAGES[pd.img as keyof typeof IMAGES];
    const product = await prisma.product.create({
      data: {
        name: pd.name,
        slug: faker.helpers.slugify(pd.name).toLowerCase(),
        description: pd.desc,
        shortDescription: pd.desc,
        basePrice: pd.price,
        compareAtPrice: pd.compare || null,
        cost: pd.price * 0.6,
        sku: faker.string.alphanumeric(8).toUpperCase(),
        barcode: faker.string.numeric(13),
        featuredImage: imgs[0],
        images: imgs.slice(0, 3),
        status: 'PUBLISHED',
        isVisible: true,
        isFeatured: Math.random() > 0.7,
        metaTitle: pd.name,
        metaDescription: pd.desc,
        publishedAt: new Date(),
        categories: { connect: [{ id: cats[pd.cat].id }] },
        tags: { connect: pd.tags.map(i => ({ id: tags[i].id })) },
      },
    });
    products.push(product);
  }
  console.log(`✅ ${products.length} products\n`);

  // 5. Variants & Inventory
  console.log('🎨 Variants...');
  let variantCount = 0;
  for (const product of products) {
    const numVariants = faker.number.int({ min: 2, max: 4 });
    for (let i = 0; i < numVariants; i++) {
      const variant = await prisma.productVariant.create({
        data: {
          productId: product.id,
          name: `Variant ${i + 1}`,
          sku: faker.string.alphanumeric(10).toUpperCase(),
          barcode: faker.string.numeric(13),
          attributes: { option: `Option ${i + 1}` },
          price: Number(product.basePrice) + (i * 10),
          compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) + (i * 10) : null,
          cost: Number(product.basePrice) * 0.6,
          image: product.images[i % product.images.length],
          isActive: true,
        },
      });
      
      const qty = faker.number.int({ min: 10, max: 500 });
      await prisma.inventory.create({
        data: {
          productVariantId: variant.id,
          quantity: qty,
          reserved: 0,
          available: qty,
          lowStockThreshold: 10,
          trackInventory: true,
          allowBackorder: false,
          lastRestockedAt: faker.date.recent({ days: 30 }),
        },
      });
      variantCount++;
    }
  }
  console.log(`✅ ${variantCount} variants\n`);

  // 6. Customers
  console.log('👥 Customers...');
  const customers: any[] = [];
  for (let i = 0; i < 50; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const customer = await prisma.customer.create({
      data: {
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        firstName,
        lastName,
        phone: faker.phone.number(),
        company: Math.random() > 0.7 ? faker.company.name() : null,
        shippingAddress: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          zipCode: faker.location.zipCode(),
          country: 'USA',
        },
        billingAddress: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          zipCode: faker.location.zipCode(),
          country: 'USA',
        },
        notes: Math.random() > 0.8 ? faker.lorem.sentence() : null,
        tags: faker.helpers.arrayElements(['VIP', 'Wholesale', 'Retail'], faker.number.int({ min: 0, max: 2 })),
        portalToken: faker.string.alphanumeric(32),
        portalExpiresAt: faker.date.future({ years: 1 }),
        lastOrderAt: faker.date.recent({ days: 90 }),
      },
    });
    customers.push(customer);
  }
  console.log(`✅ ${customers.length} customers\n`);

  // 7. Orders
  console.log('📦 Orders...');
  const orders: any[] = [];
  for (let i = 0; i < 100; i++) {
    const customer = faker.helpers.arrayElement(customers);
    const status = faker.helpers.arrayElement(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const);
    const paymentStatus = status === 'CANCELLED' ? 'REFUNDED' : faker.helpers.arrayElement(['PENDING', 'PAID', 'FAILED'] as const);
    const fulfillmentStatus = status === 'DELIVERED' ? 'FULFILLED' : faker.helpers.arrayElement(['UNFULFILLED', 'PARTIALLY_FULFILLED', 'FULFILLED'] as const);
    
    const numItems = faker.number.int({ min: 1, max: 5 });
    const orderProducts = faker.helpers.arrayElements(products, numItems);
    
    let subtotal = 0;
    const orderItems: any[] = [];
    
    for (const product of orderProducts) {
      const variants = await prisma.productVariant.findMany({ where: { productId: product.id } });
      const variant = faker.helpers.arrayElement(variants);
      const quantity = faker.number.int({ min: 1, max: 3 });
      const unitPrice = Number(variant.price || product.basePrice);
      const totalPrice = unitPrice * quantity;
      
      subtotal += totalPrice;
      orderItems.push({
        productId: product.id,
        productVariantId: variant.id,
        productName: product.name,
        variantName: variant.name,
        sku: variant.sku,
        quantity,
        unitPrice,
        totalPrice,
      });
    }
    
    const tax = subtotal * 0.08;
    const shippingMethod = faker.helpers.arrayElement(shipping);
    const shippingCost = Number(shippingMethod.price);
    const discount = Math.random() > 0.8 ? subtotal * 0.1 : 0;
    const total = subtotal + tax + shippingCost - discount;
    
    // Create orders within the last 30 days to show in dashboard
    const createdAt = faker.date.recent({ days: 30 });
    
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${faker.string.numeric(6)}`,
        customerId: customer.id,
        status,
        paymentStatus,
        fulfillmentStatus,
        subtotal,
        tax,
        shipping: shippingCost,
        discount,
        total,
        shippingAddress: customer.shippingAddress as any,
        billingAddress: customer.billingAddress as any,
        shippingMethodId: shippingMethod.id,
        trackingNumber: status === 'SHIPPED' || status === 'DELIVERED' ? faker.string.alphanumeric(16).toUpperCase() : null,
        customerEmail: customer.email,
        customerName: `${customer.firstName} ${customer.lastName}`,
        customerPhone: customer.phone,
        customerNotes: Math.random() > 0.7 ? faker.lorem.sentence() : null,
        internalNotes: Math.random() > 0.8 ? faker.lorem.sentence() : null,
        createdAt,
        paidAt: paymentStatus === 'PAID' ? faker.date.between({ from: createdAt, to: new Date() }) : null,
        shippedAt: status === 'SHIPPED' || status === 'DELIVERED' ? faker.date.between({ from: createdAt, to: new Date() }) : null,
        deliveredAt: status === 'DELIVERED' ? faker.date.between({ from: createdAt, to: new Date() }) : null,
        cancelledAt: status === 'CANCELLED' ? faker.date.between({ from: createdAt, to: new Date() }) : null,
        items: { create: orderItems },
      },
    });

    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        fromStatus: null,
        toStatus: status,
        notes: `Order ${status.toLowerCase()}`,
        createdAt,
      },
    });

    orders.push(order);
  }
  console.log(`✅ ${orders.length} orders\n`);

  // 8. Settings
  console.log('⚙️  Settings...');
  await prisma.ecommerceSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      scope: 'global',
      storeName: 'Demo Store',
      storeDescription: 'Quality products for everyone',
      currency: 'USD',
      currencySymbol: '$',
      taxRate: 8.0,
      taxLabel: 'Sales Tax',
      shippingEnabled: true,
      portalEnabled: true,
      allowGuestCheckout: false,
      trackInventory: true,
      lowStockThreshold: 10,
      autoGenerateOrderNumbers: true,
      orderNumberPrefix: 'ORD',
    },
  });
  console.log('✅ Settings\n');

  console.log('📊 Summary:');
  console.log(`   Shipping: ${shipping.length}`);
  console.log(`   Categories: ${cats.length}`);
  console.log(`   Tags: ${tags.length}`);
  console.log(`   Products: ${products.length}`);
  console.log(`   Variants: ${variantCount}`);
  console.log(`   Customers: ${customers.length}`);
  console.log(`   Orders: ${orders.length}`);
  console.log('\n🎉 Seed complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
