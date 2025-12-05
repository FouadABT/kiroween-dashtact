import { IsString, IsOptional, IsInt, Min, Max, IsIn, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for search query parameters
 * Used for full search endpoint with pagination
 */
export class SearchQueryDto {
  @ApiProperty({
    description: 'Search query string',
    example: 'user',
    maxLength: 200,
  })
  @IsString()
  @MaxLength(200, { message: 'Query cannot exceed 200 characters' })
  q: string;

  @ApiPropertyOptional({
    description: 'Entity type filter',
    enum: ['all', 'users', 'products', 'posts', 'pages', 'customers', 'orders'],
    default: 'all',
  })
  @IsOptional()
  @IsIn(['all', 'users', 'products', 'posts', 'pages', 'customers', 'orders'], {
    message: 'Invalid entity type',
  })
  type?: string = 'all';

  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of results per page',
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Sort order for results',
    enum: ['relevance', 'date', 'name'],
    default: 'relevance',
  })
  @IsOptional()
  @IsIn(['relevance', 'date', 'name'], {
    message: 'Sort must be one of: relevance, date, name',
  })
  sortBy?: string = 'relevance';
}
