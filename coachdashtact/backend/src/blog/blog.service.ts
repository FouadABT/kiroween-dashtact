import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { BlogQueryDto } from './dto/blog-query.dto';
import { PostStatus, Prisma } from '@prisma/client';
import { generateExcerpt } from './utils/excerpt-generator';
import { UsageTracker } from '../uploads/helpers/usage-tracker';

@Injectable()
export class BlogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usageTracker: UsageTracker,
  ) {}

  /**
   * Generate URL-friendly slug from title
   */
  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Ensure slug is unique by appending a number if necessary
   */
  async ensureUniqueSlug(slug: string, excludeId?: string): Promise<string> {
    let uniqueSlug = slug;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.blogPost.findUnique({
        where: { slug: uniqueSlug },
      });

      if (!existing || (excludeId && existing.id === excludeId)) {
        return uniqueSlug;
      }

      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }
  }

  /**
   * Validate if a slug is available
   * Returns availability status and suggestions if taken
   */
  async validateSlug(slug: string, excludeId?: string) {
    const existing = await this.prisma.blogPost.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        status: true,
      },
    });

    // Slug is available if no post exists or it's the same post being edited
    const isAvailable = !existing || (excludeId && existing.id === excludeId);

    if (isAvailable) {
      return {
        available: true,
        slug,
        message: 'Slug is available',
      };
    }

    // Generate alternative suggestions
    const suggestions: string[] = [];
    for (let i = 1; i <= 3; i++) {
      const suggestion = `${slug}-${i}`;
      const suggestionExists = await this.prisma.blogPost.findUnique({
        where: { slug: suggestion },
      });
      if (!suggestionExists) {
        suggestions.push(suggestion);
      }
    }

    return {
      available: false,
      slug,
      message: `Slug "${slug}" is already in use by "${existing.title}"`,
      existingPost: {
        id: existing.id,
        title: existing.title,
        status: existing.status,
      },
      suggestions,
    };
  }

  /**
   * Create a new blog post
   */
  async create(createBlogPostDto: CreateBlogPostDto, userId?: string) {
    const {
      title,
      slug: providedSlug,
      excerpt,
      content,
      featuredImage,
      status,
      categoryIds,
      tagIds,
      metaTitle,
      metaDescription,
    } = createBlogPostDto;

    // Generate slug from title if not provided
    const baseSlug = providedSlug || this.generateSlug(title);

    // Ensure slug is unique
    const slug = await this.ensureUniqueSlug(baseSlug);

    // Auto-generate excerpt if not provided
    const finalExcerpt = excerpt || generateExcerpt(content, 200);

    // Create blog post with relations
    const post = await this.prisma.blogPost.create({
      data: {
        title,
        slug,
        excerpt: finalExcerpt,
        content,
        featuredImage,
        status: status || PostStatus.DRAFT,
        authorId: userId,
        metaTitle,
        metaDescription,
        categories: categoryIds?.length
          ? {
              connect: categoryIds.map((id) => ({ id })),
            }
          : undefined,
        tags: tagIds?.length
          ? {
              connect: tagIds.map((id) => ({ id })),
            }
          : undefined,
        publishedAt: status === PostStatus.PUBLISHED ? new Date() : null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        categories: true,
        tags: true,
      },
    });

    // Track featured image usage
    if (featuredImage) {
      await this.usageTracker.trackUsage(featuredImage, 'blogPosts', post.id);
    }

    return post;
  }

  /**
   * Find all blog posts (admin - includes drafts)
   */
  async findAll(query: BlogQueryDto) {
    const {
      page = 1,
      limit = 10,
      cursor,
      status,
      category,
      tag,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const where: Prisma.BlogPostWhereInput = {};

    // Filter by status
    if (status) {
      where.status = status;
    }

    // Filter by category
    if (category) {
      where.categories = {
        some: {
          slug: category,
        },
      };
    }

    // Filter by tag
    if (tag) {
      where.tags = {
        some: {
          slug: tag,
        },
      };
    }

    // Search in title and content
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Use cursor-based pagination if cursor is provided
    if (cursor) {
      const posts = await this.prisma.blogPost.findMany({
        where,
        take: limit + 1, // Fetch one extra to determine if there's a next page
        cursor: {
          id: cursor,
        },
        skip: 1, // Skip the cursor itself
        orderBy: { [sortBy]: sortOrder },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          categories: true,
          tags: true,
        },
      });

      const hasNextPage = posts.length > limit;
      const results = hasNextPage ? posts.slice(0, -1) : posts;
      const nextCursor = hasNextPage ? results[results.length - 1].id : null;

      return {
        posts: results,
        pagination: {
          limit,
          hasNextPage,
          nextCursor,
        },
      };
    }

    // Use offset-based pagination (default)
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          categories: true,
          tags: true,
        },
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    return {
      posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find published blog posts (public)
   */
  async findPublished(query: BlogQueryDto) {
    return this.findAll({
      ...query,
      status: PostStatus.PUBLISHED,
    });
  }

  /**
   * Find one blog post by ID
   */
  async findOne(id: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        categories: true,
        tags: true,
      },
    });

    if (!post) {
      throw new NotFoundException(`Blog post with ID "${id}" not found`);
    }

    return post;
  }

  /**
   * Find one blog post by slug (public)
   */
  async findBySlug(slug: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        categories: true,
        tags: true,
      },
    });

    if (!post) {
      throw new NotFoundException(`Blog post with slug "${slug}" not found`);
    }

    // Only return published posts for public access
    if (post.status !== PostStatus.PUBLISHED) {
      throw new NotFoundException(`Blog post with slug "${slug}" not found`);
    }

    return post;
  }

  /**
   * Update a blog post
   */
  async update(id: string, updateBlogPostDto: UpdateBlogPostDto) {
    const { categoryIds, tagIds, ...updateData } = updateBlogPostDto;

    // Check if post exists
    const existingPost = await this.findOne(id);

    // Check if slug is being changed and if it conflicts
    if (updateData.slug && updateData.slug !== existingPost.slug) {
      const slugConflict = await this.prisma.blogPost.findUnique({
        where: { slug: updateData.slug },
        select: {
          id: true,
          title: true,
        },
      });

      if (slugConflict && slugConflict.id !== id) {
        throw new ConflictException(
          `Slug "${updateData.slug}" is already in use by "${slugConflict.title}". Please choose a different slug.`,
        );
      }
    }

    // Auto-generate excerpt if content is updated but excerpt is not provided
    let finalExcerpt = updateData.excerpt;
    if (updateData.content && !updateData.excerpt) {
      // Only auto-generate if excerpt wasn't explicitly set to empty string
      if (updateData.excerpt !== '') {
        finalExcerpt = generateExcerpt(updateData.content, 200);
      }
    }

    const post = await this.prisma.blogPost.update({
      where: { id },
      data: {
        ...updateData,
        excerpt: finalExcerpt,
        categories: categoryIds
          ? {
              set: categoryIds.map((id) => ({ id })),
            }
          : undefined,
        tags: tagIds
          ? {
              set: tagIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        categories: true,
        tags: true,
      },
    });

    // Track featured image usage if updated
    if (updateData.featuredImage && updateData.featuredImage !== existingPost.featuredImage) {
      await this.usageTracker.trackUsage(updateData.featuredImage, 'blogPosts', post.id);
    }

    return post;
  }

  /**
   * Publish a blog post
   */
  async publish(id: string) {
    await this.findOne(id);

    return this.prisma.blogPost.update({
      where: { id },
      data: {
        status: PostStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        categories: true,
        tags: true,
      },
    });
  }

  /**
   * Unpublish a blog post
   */
  async unpublish(id: string) {
    await this.findOne(id);

    return this.prisma.blogPost.update({
      where: { id },
      data: {
        status: PostStatus.DRAFT,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        categories: true,
        tags: true,
      },
    });
  }

  /**
   * Delete a blog post
   */
  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.blogPost.delete({
      where: { id },
    });
  }

  /**
   * Get all categories
   */
  async findAllCategories() {
    try {
      return await this.prisma.blogCategory.findMany({
        include: {
          _count: {
            select: {
              posts: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch {
      // Return empty array if table doesn't exist yet
      return [];
    }
  }

  /**
   * Get all tags
   */
  async findAllTags() {
    try {
      return await this.prisma.blogTag.findMany({
        include: {
          _count: {
            select: {
              posts: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch {
      // Return empty array if table doesn't exist yet
      return [];
    }
  }

  /**
   * Create a new category
   */
  async createCategory(name: string, slug?: string, description?: string) {
    // Generate slug from name if not provided
    const baseSlug = slug || this.generateSlug(name);

    // Ensure slug is unique
    let uniqueSlug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.blogCategory.findUnique({
        where: { slug: uniqueSlug },
      });

      if (!existing) {
        break;
      }

      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    return this.prisma.blogCategory.create({
      data: {
        name,
        slug: uniqueSlug,
        description,
      },
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });
  }

  /**
   * Update a category
   */
  async updateCategory(
    id: string,
    name?: string,
    slug?: string,
    description?: string,
  ) {
    // Check if category exists
    const category = await this.prisma.blogCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    // Check if slug is being changed and if it conflicts
    if (slug && slug !== category.slug) {
      const existingCategory = await this.prisma.blogCategory.findUnique({
        where: { slug },
      });

      if (existingCategory && existingCategory.id !== id) {
        throw new ConflictException(
          `Category with slug "${slug}" already exists`,
        );
      }
    }

    return this.prisma.blogCategory.update({
      where: { id },
      data: {
        name,
        slug,
        description,
      },
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });
  }

  /**
   * Delete a category
   */
  async deleteCategory(id: string) {
    // Check if category exists
    const category = await this.prisma.blogCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    // Check if category has posts
    if (category._count.posts > 0) {
      throw new ConflictException(
        `Cannot delete category "${category.name}" because it has ${category._count.posts} associated posts`,
      );
    }

    return this.prisma.blogCategory.delete({
      where: { id },
    });
  }

  /**
   * Create a new tag
   */
  async createTag(name: string, slug?: string) {
    // Generate slug from name if not provided
    const baseSlug = slug || this.generateSlug(name);

    // Ensure slug is unique
    let uniqueSlug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.blogTag.findUnique({
        where: { slug: uniqueSlug },
      });

      if (!existing) {
        break;
      }

      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    return this.prisma.blogTag.create({
      data: {
        name,
        slug: uniqueSlug,
      },
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });
  }

  /**
   * Update a tag
   */
  async updateTag(id: string, name?: string, slug?: string) {
    // Check if tag exists
    const tag = await this.prisma.blogTag.findUnique({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID "${id}" not found`);
    }

    // Check if slug is being changed and if it conflicts
    if (slug && slug !== tag.slug) {
      const existingTag = await this.prisma.blogTag.findUnique({
        where: { slug },
      });

      if (existingTag && existingTag.id !== id) {
        throw new ConflictException(`Tag with slug "${slug}" already exists`);
      }
    }

    return this.prisma.blogTag.update({
      where: { id },
      data: {
        name,
        slug,
      },
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });
  }

  /**
   * Delete a tag
   */
  async deleteTag(id: string) {
    // Check if tag exists
    const tag = await this.prisma.blogTag.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID "${id}" not found`);
    }

    // Check if tag has posts
    if (tag._count.posts > 0) {
      throw new ConflictException(
        `Cannot delete tag "${tag.name}" because it has ${tag._count.posts} associated posts`,
      );
    }

    return this.prisma.blogTag.delete({
      where: { id },
    });
  }

  /**
   * Preview auto-generated excerpt
   */
  previewExcerpt(content: string, maxLength: number = 200) {
    const excerpt = generateExcerpt(content, maxLength);

    return {
      excerpt,
      characterCount: excerpt.length,
      maxLength,
      isAutoGenerated: true,
    };
  }
}
