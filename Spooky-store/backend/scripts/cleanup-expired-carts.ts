import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Cleanup Expired Carts Script
 * 
 * This script deletes carts that have expired (expiresAt < now()).
 * Cart items are automatically deleted via cascade.
 * 
 * Usage:
 *   npm run cleanup:carts
 * 
 * Scheduling as a cron job (daily at 2 AM):
 * 
 * Linux/Mac (crontab):
 *   0 2 * * * cd /path/to/backend && npm run cleanup:carts >> /var/log/cart-cleanup.log 2>&1
 * 
 * Windows (Task Scheduler):
 *   1. Open Task Scheduler
 *   2. Create Basic Task
 *   3. Trigger: Daily at 2:00 AM
 *   4. Action: Start a program
 *   5. Program: npm
 *   6. Arguments: run cleanup:carts
 *   7. Start in: C:\path\to\backend
 * 
 * Docker (docker-compose.yml):
 *   Add a service with cron:
 *   
 *   cart-cleanup:
 *     image: node:18-alpine
 *     volumes:
 *       - ./backend:/app
 *     working_dir: /app
 *     command: sh -c "echo '0 2 * * * cd /app && npm run cleanup:carts' | crontab - && crond -f"
 * 
 * Kubernetes (CronJob):
 *   
 *   apiVersion: batch/v1
 *   kind: CronJob
 *   metadata:
 *     name: cart-cleanup
 *   spec:
 *     schedule: "0 2 * * *"
 *     jobTemplate:
 *       spec:
 *         template:
 *           spec:
 *             containers:
 *             - name: cleanup
 *               image: your-backend-image
 *               command: ["npm", "run", "cleanup:carts"]
 *             restartPolicy: OnFailure
 */

async function cleanupExpiredCarts() {
  console.log('🧹 Starting expired cart cleanup...');
  console.log(`⏰ Current time: ${new Date().toISOString()}`);

  try {
    // Find expired carts
    const expiredCarts = await prisma.cart.findMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
      include: {
        items: true,
      },
    });

    if (expiredCarts.length === 0) {
      console.log('✅ No expired carts found');
      return;
    }

    console.log(`📦 Found ${expiredCarts.length} expired cart(s)`);

    // Count total items that will be deleted
    const totalItems = expiredCarts.reduce(
      (sum, cart) => sum + cart.items.length,
      0,
    );

    // Delete expired carts (cascade will handle cart items)
    const result = await prisma.cart.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    console.log(`✅ Deleted ${result.count} expired cart(s)`);
    console.log(`📝 ${totalItems} cart item(s) were also deleted (cascade)`);

    // Log some statistics
    const oldestExpired = expiredCarts.reduce((oldest, cart) => {
      return cart.expiresAt < oldest ? cart.expiresAt : oldest;
    }, expiredCarts[0].expiresAt);

    const daysSinceOldest = Math.floor(
      (Date.now() - oldestExpired.getTime()) / (1000 * 60 * 60 * 24),
    );

    console.log(`📊 Oldest expired cart was ${daysSinceOldest} day(s) old`);
    console.log('✨ Cleanup completed successfully!');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

// Run the cleanup
cleanupExpiredCarts()
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
