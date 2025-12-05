import { ApiProperty } from '@nestjs/swagger';
import { SearchResultDto } from './search-result.dto';

/**
 * DTO for paginated search results
 */
export class PaginatedSearchResultDto {
  @ApiProperty({
    description: 'Array of search results',
    type: [SearchResultDto],
  })
  results: SearchResultDto[];

  @ApiProperty({
    description: 'Total count of matching results',
    example: 42,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of results per page',
    example: 20,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 3,
  })
  totalPages: number;
}
