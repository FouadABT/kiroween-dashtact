import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for quick search query parameters
 * Used for Cmd+K dialog with top 8 results
 */
export class QuickSearchQueryDto {
  @ApiProperty({
    description: 'Search query string',
    example: 'user',
    maxLength: 200,
  })
  @IsString()
  @MaxLength(200, { message: 'Query cannot exceed 200 characters' })
  q: string;
}
