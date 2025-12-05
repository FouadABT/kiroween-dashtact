import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to skip activity logging for specific routes
 * 
 * @example
 * ```typescript
 * @Post()
 * @SkipActivityLog()
 * async someAction() {
 *   // This action won't be logged
 * }
 * ```
 */
export const SkipActivityLog = () => SetMetadata('skipActivityLog', true);
