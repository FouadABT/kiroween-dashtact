const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateUserRole() {
  try {
    // Find the admin role (proper case "Admin" with permissions)
    const adminRole = await prisma.userRole.findUnique({
      where: { name: 'Admin' }
    });

    if (!adminRole) {
      console.error('Admin role not found');
      process.exit(1);
    }

    console.log('Found Admin role:', adminRole.id, adminRole.name);

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { email: 'fouad.abt@gmail.com' },
      data: { roleId: adminRole.id },
      include: { role: true }
    });

    console.log('✅ User role updated successfully!');
    console.log('User:', updatedUser.email);
    console.log('Name:', updatedUser.name);
    console.log('New Role:', updatedUser.role.name);
    console.log('Role ID:', updatedUser.roleId);

    // Verify permissions
    const permissions = await prisma.rolePermission.findMany({
      where: { roleId: adminRole.id },
      include: { permission: true }
    });

    console.log('\n📋 Permissions for Admin role:');
    permissions.forEach(rp => {
      console.log(`  - ${rp.permission.name}`);
    });
  } catch (error) {
    console.error('Error updating user role:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserRole();
