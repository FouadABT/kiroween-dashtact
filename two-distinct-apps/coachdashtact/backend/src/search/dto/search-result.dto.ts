import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for a single search result item
 */
export class SearchResultDto {
  @ApiProperty({
    description: 'Unique identifier of the entity',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Type of entity',
    enum: ['users', 'products', 'posts', 'pages', 'customers', 'orders'],
    example: 'users',
  })
  entityType: string;

  @ApiProperty({
    description: 'Display title of the entity',
    example: 'John Doe',
  })
  title: string;

  @ApiProperty({
    description: 'Brief description or excerpt',
    example: 'john.doe@example.com • Admin',
  })
  description: string;

  @ApiProperty({
    description: 'URL path to entity detail page',
    example: '/dashboard/users/123e4567-e89b-12d3-a456-426614174000',
  })
  url: string;

  @ApiProperty({
    description: 'Additional metadata about the entity',
    example: {
      date: '2024-01-15T10:30:00Z',
      author: 'Admin',
      status: 'Active',
    },
  })
  metadata: Record<string, any>;

  @ApiProperty({
    description: 'Relevance score for sorting',
    example: 85,
  })
  relevanceScore: number;
}
