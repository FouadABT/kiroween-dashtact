/**
 * Role Name Consistency Verification
 * 
 * Verifies that all role checks use the correct role name from the database
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function verifyRoleConsistency() {
  console.log('🔍 Verifying Role Name Consistency\n');
  console.log('='.repeat(60));

  // Get actual role names from database
  const roles = await prisma.userRole.findMany({
    select: { name: true },
  });

  console.log('\n📋 Roles in Database:\n');
  roles.forEach(role => {
    console.log(`  - "${role.name}"`);
  });

  // Check SuperAdminGuard
  console.log('\n🔒 Checking SuperAdminGuard...\n');
  
  const guardPath = path.join(__dirname, 'src/email/guards/super-admin.guard.ts');
  const guardContent = fs.readFileSync(guardPath, 'utf-8');
  
  const superAdminMatch = guardContent.match(/role\.name !== '([^']+)'/);
  
  if (superAdminMatch) {
    const guardRoleName = superAdminMatch[1];
    const dbRoleName = roles.find(r => r.name.toLowerCase().includes('super admin'))?.name;
    
    if (guardRoleName === dbRoleName) {
      console.log(`  ✅ SuperAdminGuard uses correct role: "${guardRoleName}"`);
    } else {
      console.log(`  ❌ SuperAdminGuard role mismatch!`);
      console.log(`     Guard expects: "${guardRoleName}"`);
      console.log(`     Database has: "${dbRoleName}"`);
    }
  }

  // Check uploads service
  console.log('\n📁 Checking Uploads Service...\n');
  
  const uploadsPath = path.join(__dirname, 'src/uploads/uploads.service.ts');
  const uploadsContent = fs.readFileSync(uploadsPath, 'utf-8');
  
  const uploadsMatches = uploadsContent.match(/role\?\.name === '([^']+)'/g);
  
  if (uploadsMatches) {
    uploadsMatches.forEach(match => {
      const roleName = match.match(/'([^']+)'/)[1];
      const dbRole = roles.find(r => r.name === roleName);
      
      if (dbRole) {
        console.log(`  ✅ Uses correct role: "${roleName}"`);
      } else {
        console.log(`  ❌ Role not found in database: "${roleName}"`);
      }
    });
  }

  // Check file access middleware
  console.log('\n🔐 Checking File Access Middleware...\n');
  
  const middlewarePath = path.join(__dirname, 'src/uploads/middleware/file-access.middleware.ts');
  const middlewareContent = fs.readFileSync(middlewarePath, 'utf-8');
  
  const middlewareMatches = middlewareContent.match(/role\?\.name === '([^']+)'/g);
  
  if (middlewareMatches) {
    middlewareMatches.forEach(match => {
      const roleName = match.match(/'([^']+)'/)[1];
      const dbRole = roles.find(r => r.name === roleName);
      
      if (dbRole) {
        console.log(`  ✅ Uses correct role: "${roleName}"`);
      } else {
        console.log(`  ❌ Role not found in database: "${roleName}"`);
      }
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ Verification Complete!\n');
  console.log('If you see any ❌ marks above, those files need to be updated');
  console.log('to use the exact role names from the database.\n');

  await prisma.$disconnect();
}

verifyRoleConsistency().catch(error => {
  console.error('Verification failed:', error);
  prisma.$disconnect();
  process.exit(1);
});
