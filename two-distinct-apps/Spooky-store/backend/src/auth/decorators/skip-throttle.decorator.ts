import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to skip rate limiting for specific routes
 * 
 * @example
 * @SkipThrottle()
 * @Get('public-endpoint')
 * async getPublicData() { ... }
 */
export const SKIP_THROTTLE_KEY = 'skipThrottle';
export const SkipThrottle = () => SetMetadata(SKIP_THROTTLE_KEY, true);
