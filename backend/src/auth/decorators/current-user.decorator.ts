import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * User object attached to request by JWT strategy
 */
export interface RequestUser {
  id: string;
  email: string;
  name: string | null;
  roleId: string;
  role: {
    id: string;
    name: string;
    description: string | null;
  };
  permissions: string[];
}

/**
 * Current User Decorator
 * Extracts the current user from the request object
 * User is attached by JwtStrategy after token validation
 * 
 * @example
 * @Get('profile')
 * @UseGuards(JwtAuthGuard)
 * getProfile(@CurrentUser() user: RequestUser) {
 *   return user;
 * }
 * 
 * @example
 * // Get specific property
 * @Get('email')
 * @UseGuards(JwtAuthGuard)
 * getEmail(@CurrentUser('email') email: string) {
 *   return { email };
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: keyof RequestUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // If a specific property is requested, return that property
    if (data) {
      return user?.[data];
    }

    // Otherwise, return the entire user object
    return user;
  },
);
