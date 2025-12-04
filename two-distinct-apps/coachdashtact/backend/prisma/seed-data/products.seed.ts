import { PrismaClient, ProductStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedProducts() {
  console.log('🛍️  Seeding products...');

  // Create categories first
  const yogaCategory = await prisma.productCategory.upsert({
    where: { slug: 'yoga' },
    update: {},
    create: {
      name: 'Yoga',
      slug: 'yoga',
      description: 'Yoga equipment and accessories',
      isVisible: true,
      displayOrder: 1,
    },
  });

  const fitnessCategory = await prisma.productCategory.upsert({
    where: { slug: 'fitness' },
    update: {},
    create: {
      name: 'Fitness',
      slug: 'fitness',
      description: 'Fitness equipment and gear',
      isVisible: true,
      displayOrder: 2,
    },
  });

  const sportsCategory = await prisma.productCategory.upsert({
    where: { slug: 'sports' },
    update: {},
    create: {
      name: 'Sports',
      slug: 'sports',
      description: 'Sports equipment',
      isVisible: true,
      displayOrder: 3,
    },
  });

  // Sample products with their categories and CDN images
  const products = [
    {
      name: 'Premium Yoga Mat',
      slug: 'premium-yoga-mat',
      description: 'High-quality non-slip yoga mat perfect for all types of yoga practice',
      shortDescription: 'Non-slip yoga mat for all practice levels',
      basePrice: 49.99,
      compareAtPrice: 79.99,
      status: ProductStatus.PUBLISHED,
      isVisible: true,
      isFeatured: true,
      category: yogaCategory,
      featuredImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&h=500&fit=crop',
      images: ['https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&h=500&fit=crop', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=800&fit=crop'],
    },
    {
      name: 'Yoga Blocks Set',
      slug: 'yoga-blocks-set',
      description: 'Set of 2 foam yoga blocks for better alignment and support',
      shortDescription: 'Foam yoga blocks for alignment support',
      basePrice: 24.99,
      compareAtPrice: 39.99,
      status: ProductStatus.PUBLISHED,
      isVisible: true,
      isFeatured: false,
      category: yogaCategory,
      featuredImage: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=500&h=500&fit=crop',
      images: ['https://images.unsplash.com/photo-1519861531473-9200262188bf?w=500&h=500&fit=crop'],
    },
    {
      name: 'Yoga Strap',
      slug: 'yoga-strap',
      description: 'Durable cotton yoga strap with D-ring buckle for deeper stretches',
      shortDescription: 'Cotton yoga strap with D-ring buckle',
      basePrice: 14.99,
      compareAtPrice: null,
      status: ProductStatus.PUBLISHED,
      isVisible: true,
      isFeatured: false,
      category: yogaCategory,
      featuredImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop',
      images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop'],
    },
    {
      name: 'Running Shoes Pro',
      slug: 'running-shoes-pro',
      description: 'Professional running shoes with advanced cushioning technology',
      shortDescription: 'Advanced cushioning running shoes',
      basePrice: 129.99,
      compareAtPrice: 179.99,
      status: ProductStatus.PUBLISHED,
      isVisible: true,
      isFeatured: true,
      category: fitnessCategory,
      featuredImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
      images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop'],
    },
    {
      name: 'Dumbbells Set',
      slug: 'dumbbells-set',
      description: 'Adjustable dumbbells set from 5 to 25 lbs',
      shortDescription: 'Adjustable dumbbells 5-25 lbs',
      basePrice: 199.99,
      compareAtPrice: 299.99,
      status: ProductStatus.PUBLISHED,
      isVisible: true,
      isFeatured: false,
      category: fitnessCategory,
      featuredImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=500&fit=crop',
      images: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=500&fit=crop'],
    },
    {
      name: 'Resistance Bands',
      slug: 'resistance-bands',
      description: 'Set of 5 resistance bands with different resistance levels',
      shortDescription: 'Set of 5 resistance bands',
      basePrice: 29.99,
      compareAtPrice: 49.99,
      status: ProductStatus.PUBLISHED,
      isVisible: true,
      isFeatured: false,
      category: fitnessCategory,
      featuredImage: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500&h=500&fit=crop',
      images: ['https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500&h=500&fit=crop'],
    },
    {
      name: 'Basketball Official',
      slug: 'basketball-official',
      description: 'Official size basketball for indoor and outdoor play',
      shortDescription: 'Official size basketball',
      basePrice: 59.99,
      compareAtPrice: 89.99,
      status: ProductStatus.PUBLISHED,
      isVisible: true,
      isFeatured: false,
      category: sportsCategory,
      featuredImage: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=500&h=500&fit=crop',
      images: ['https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=500&h=500&fit=crop'],
    },
    {
      name: 'Tennis Racket Pro',
      slug: 'tennis-racket-pro',
      description: 'Professional tennis racket with carbon fiber frame',
      shortDescription: 'Carbon fiber tennis racket',
      basePrice: 149.99,
      compareAtPrice: 199.99,
      status: ProductStatus.PUBLISHED,
      isVisible: true,
      isFeatured: true,
      category: sportsCategory,
      featuredImage: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&h=500&fit=crop',
      images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&h=500&fit=crop'],
    },
  ];

  for (const productData of products) {
    const existing = await prisma.product.findUnique({
      where: { slug: productData.slug },
    });

    if (!existing) {
      const { category, featuredImage, images, ...data } = productData;
      const product = await prisma.product.create({
        data: {
          ...data,
          featuredImage,
          images,
          categories: {
            connect: { id: category.id },
          },
        },
      });

      // Create a default variant
      await prisma.productVariant.create({
        data: {
          productId: product.id,
          name: 'Default',
          sku: `${product.slug}-001`,
          price: product.basePrice,
          isActive: true,
          attributes: {},
          inventory: {
            create: {
              quantity: 100,
              reserved: 0,
              available: 100,
            },
          },
        },
      });

      console.log(`✅ Created product: ${productData.name}`);
    } else {
      // Update existing product with images if not already set
      const updated = await prisma.product.update({
        where: { slug: productData.slug },
        data: {
          featuredImage: productData.featuredImage,
          images: productData.images,
        },
      });
      console.log(`✅ Updated product images: ${productData.name}`);
    }
  }

  console.log('✅ Products seeded successfully!');
}
