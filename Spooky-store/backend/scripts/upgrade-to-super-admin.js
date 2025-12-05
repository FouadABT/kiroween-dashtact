const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || 'fouad.abt@gmail.com';
  
  console.log('Upgrading user:', email);
  
  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true }
  });
  
  if (!user) {
    console.log('User not found!');
    return;
  }
  
  console.log('Current role:', user.role.name);
  
  const superAdmin = await prisma.userRole.findUnique({
    where: { name: 'Super Admin' }
  });
  
  if (!superAdmin) {
    console.log('Super Admin role not found!');
    return;
  }
  
  await prisma.user.update({
    where: { id: user.id },
    data: { roleId: superAdmin.id }
  });
  
  console.log('SUCCESS! User upgraded to Super Admin');
  console.log('Please log out and log back in!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
