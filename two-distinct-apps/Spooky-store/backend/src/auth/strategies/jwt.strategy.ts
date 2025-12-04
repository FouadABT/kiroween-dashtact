import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaClient } from '@prisma/client';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { authConfig } from '../../config/auth.config';

/**
 * JWT Strategy for Passport
 * Validates JWT tokens and attaches user to request
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaClient) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: authConfig.jwt.secret,
      issuer: authConfig.jwt.issuer,
      audience: authConfig.jwt.audience,
    });
  }

  /**
   * Validate JWT payload and return user object
   * This method is called automatically by Passport after token verification
   * @param payload JWT payload
   * @returns User object to be attached to request
   */
  async validate(payload: JwtPayload) {
    // Verify user still exists and is active
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Extract permissions from role
    const permissions = user.role.rolePermissions.map(
      (rp) => rp.permission.name
    );

    // Return user object that will be attached to request.user
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roleId: user.roleId,
      role: {
        id: user.role.id,
        name: user.role.name,
        description: user.role.description,
      },
      permissions,
    };
  }
}
