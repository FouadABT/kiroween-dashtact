const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addCoachBranding() {
  try {
    console.log('🎨 Adding Coach Manager Dashboard Branding...\n');

    // Check if branding already exists
    const existingBranding = await prisma.brandSettings.findFirst();

    const brandingData = {
      brandName: 'CoachHub Pro',
      tagline: 'Empower Your Coaching Business',
      description: 'A modern, comprehensive dashboard for professional coaches to manage clients, schedules, sessions, and grow their coaching practice with powerful analytics and automation tools.',
      logoUrl: '/images/branding/logo-light.svg',
      logoDarkUrl: '/images/branding/logo-dark.svg',
      faviconUrl: '/images/branding/favicon.ico',
      websiteUrl: 'https://coachhub.pro',
      supportEmail: 'support@coachhub.pro',
      socialLinks: {
        twitter: 'https://twitter.com/coachhubpro',
        linkedin: 'https://linkedin.com/company/coachhubpro',
        facebook: 'https://facebook.com/coachhubpro',
        instagram: 'https://instagram.com/coachhubpro',
        youtube: 'https://youtube.com/@coachhubpro'
      }
    };

    let result;
    if (existingBranding) {
      // Update existing branding
      result = await prisma.brandSettings.update({
        where: { id: existingBranding.id },
        data: brandingData
      });
      console.log('✅ Updated existing branding settings');
    } else {
      // Create new branding
      result = await prisma.brandSettings.create({
        data: brandingData
      });
      console.log('✅ Created new branding settings');
    }

    console.log('\n📋 Branding Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Brand Name:      ${result.brandName}`);
    console.log(`Tagline:         ${result.tagline}`);
    console.log(`Description:     ${result.description.substring(0, 80)}...`);
    console.log(`Website:         ${result.websiteUrl}`);
    console.log(`Support Email:   ${result.supportEmail}`);
    console.log(`Logo (Light):    ${result.logoUrl}`);
    console.log(`Logo (Dark):     ${result.logoDarkUrl}`);
    console.log(`Favicon:         ${result.faviconUrl}`);
    console.log('\n🔗 Social Links:');
    console.log(`  Twitter:       ${result.socialLinks.twitter}`);
    console.log(`  LinkedIn:      ${result.socialLinks.linkedin}`);
    console.log(`  Facebook:      ${result.socialLinks.facebook}`);
    console.log(`  Instagram:     ${result.socialLinks.instagram}`);
    console.log(`  YouTube:       ${result.socialLinks.youtube}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✨ Branding successfully configured for Coach Manager Dashboard!');
    console.log('🌐 Visit http://localhost:3000/dashboard/settings/branding to view');

  } catch (error) {
    console.error('❌ Error adding branding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addCoachBranding()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
