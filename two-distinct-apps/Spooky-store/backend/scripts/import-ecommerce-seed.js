const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function importSeedData() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:d1d1d1f1@localhost:5432/myapp?schema=public'
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully');

    const sqlFilePath = path.join(__dirname, '../prisma/seed-ecommerce-complete.sql');
    console.log(`📄 Reading SQL file: ${sqlFilePath}`);
    
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('🚀 Executing seed data...');
    console.log('⏳ This may take a moment...\n');
    
    await client.query(sql);
    
    console.log('✅ Seed data imported successfully!\n');
    
    // Get counts
    console.log('📊 Verifying imported data:');
    
    const counts = await Promise.all([
      client.query('SELECT COUNT(*) FROM product_categories'),
      client.query('SELECT COUNT(*) FROM customers'),
      client.query('SELECT COUNT(*) FROM products'),
      client.query('SELECT COUNT(*) FROM product_variants'),
      client.query('SELECT COUNT(*) FROM inventory'),
      client.query('SELECT COUNT(*) FROM orders'),
      client.query('SELECT COUNT(*) FROM order_items'),
      client.query('SELECT COUNT(*) FROM order_notes'),
      client.query('SELECT COUNT(*) FROM order_timeline'),
      client.query('SELECT COUNT(*) FROM inventory_adjustments'),
    ]);
    
    console.log(`   ✓ Categories: ${counts[0].rows[0].count}`);
    console.log(`   ✓ Customers: ${counts[1].rows[0].count}`);
    console.log(`   ✓ Products: ${counts[2].rows[0].count}`);
    console.log(`   ✓ Product Variants: ${counts[3].rows[0].count}`);
    console.log(`   ✓ Inventory Records: ${counts[4].rows[0].count}`);
    console.log(`   ✓ Orders: ${counts[5].rows[0].count}`);
    console.log(`   ✓ Order Items: ${counts[6].rows[0].count}`);
    console.log(`   ✓ Order Notes: ${counts[7].rows[0].count}`);
    console.log(`   ✓ Timeline Events: ${counts[8].rows[0].count}`);
    console.log(`   ✓ Inventory Adjustments: ${counts[9].rows[0].count}`);
    
    console.log('\n🎉 E-commerce seed data import complete!');
    console.log('🛍️  You can now test the e-commerce features with realistic data.');
    
  } catch (error) {
    console.error('❌ Error importing seed data:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

importSeedData();
