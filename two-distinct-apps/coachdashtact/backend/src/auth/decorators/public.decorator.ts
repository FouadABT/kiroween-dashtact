import { SetMetadata } from '@nestjs/common';

/**
 * Public Decorator
 * Mark routes as public (skip authentication)
 * 
 * @example
 * @Public()
 * @Get('public-endpoint')
 * getPublicData() {
 *   return { message: 'This is public' };
 * }
 */
export const Public = () => SetMetadata('isPublic', true);
