import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SearchRateLimitGuard } from './guards/search-rate-limit.guard';
import { SearchService } from './search.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { QuickSearchQueryDto } from './dto/quick-search-query.dto';
import { PaginatedSearchResultDto } from './dto/paginated-search-result.dto';
import { SearchResultDto } from './dto/search-result.dto';

@ApiTags('search')
@Controller('search')
@UseGuards(JwtAuthGuard, SearchRateLimitGuard)
@ApiBearerAuth()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search across all entity types',
    description:
      'Performs a comprehensive search across users, products, blog posts, pages, customers, and orders. Results are filtered based on user permissions and paginated.',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
    description: 'Search query string (max 200 characters)',
    example: 'john',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    type: String,
    enum: ['all', 'users', 'products', 'posts', 'pages', 'customers', 'orders'],
    description: 'Filter by entity type',
    example: 'all',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (starts at 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Results per page (max 100)',
    example: 20,
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    enum: ['relevance', 'date', 'name'],
    description: 'Sort order for results',
    example: 'relevance',
  })
  @ApiResponse({
    status: 200,
    description: 'Search results returned successfully',
    type: PaginatedSearchResultDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid search query or parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token missing or invalid',
  })
  @ApiResponse({
    status: 429,
    description: 'Rate limit exceeded (100 requests per hour)',
  })
  async search(
    @Query() query: SearchQueryDto,
    @Request() req: any,
  ): Promise<PaginatedSearchResultDto> {
    const userId = req.user.id;
    return this.searchService.search(userId, query);
  }

  @Get('quick')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Quick search for Cmd+K dialog',
    description:
      'Returns top 8 results across all entity types for quick access. Optimized for keyboard-driven search interface.',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
    description: 'Search query string',
    example: 'john',
  })
  @ApiResponse({
    status: 200,
    description: 'Top 8 search results returned',
    type: [SearchResultDto],
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid search query',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token missing or invalid',
  })
  @ApiResponse({
    status: 429,
    description: 'Rate limit exceeded (100 requests per hour)',
  })
  async quickSearch(
    @Query() query: QuickSearchQueryDto,
    @Request() req: any,
  ): Promise<SearchResultDto[]> {
    const userId = req.user.id;
    return this.searchService.quickSearch(userId, query.q);
  }
}
