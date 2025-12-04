import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔍 Checking for existing user...');
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'fouad.abt@gmail.com' },
    });

    if (existingUser) {
      console.log('✅ User already exists:', existingUser.email);
      console.log('   Name:', existingUser.name);
      console.log('   Role ID:', existingUser.roleId);
      return;
    }

    console.log('❌ User not found. Creating user...');

    // Get Super Admin role
    const superAdminRole = await prisma.userRole.findFirst({
      where: { name: 'Super Admin' },
    });

    if (!superAdminRole) {
      throw new Error('Super Admin role not found. Please run: npm run prisma:seed');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email: 'fouad.abt@gmail.com',
        password: hashedPassword,
        name: 'Fouad Abt',
        roleId: superAdminRole.id,
      },
      include: {
        role: true,
      },
    });

    console.log('\n✅ User created successfully!');
    console.log('   Email:', newUser.email);
    console.log('   Name:', newUser.name);
    console.log('   Role:', newUser.role.name);
    console.log('   Password: Password123!');
    console.log('\n🔐 You can now login with:');
    console.log('   Email: fouad.abt@gmail.com');
    console.log('   Password: Password123!');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
