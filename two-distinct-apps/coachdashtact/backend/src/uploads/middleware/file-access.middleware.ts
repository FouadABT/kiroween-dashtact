import {
  Injectable,
  NestMiddleware,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { Visibility } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class FileAccessMiddleware implements NestMiddleware {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    try {
      // Extract filename from URL (e.g., /uploads/abc123-def456.jpg)
      const filename = req.path.split('/').pop();
      if (!filename) {
        throw new NotFoundException('File not found');
      }

      // Look up upload record
      const upload = await this.prisma.upload.findUnique({
        where: { filename, deletedAt: null },
        include: {
          uploadedBy: {
            select: { id: true, roleId: true },
          },
        },
      });

      if (!upload) {
        throw new NotFoundException('File not found');
      }

      // Extract user from JWT token
      const token = this.extractTokenFromHeader(req);
      let user: any = null;

      if (token) {
        try {
          user = await this.jwtService.verifyAsync(token);
        } catch {
          // Invalid token, treat as unauthenticated
        }
      }

      // Check access permissions based on visibility
      if (!this.canAccessFile(upload, user)) {
        throw new ForbiddenException('Access denied to this file');
      }

      // Allow request to proceed
      next();
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        res.status(error.getStatus()).json({
          statusCode: error.getStatus(),
          message: error.message,
        });
      } else {
        res.status(500).json({
          statusCode: 500,
          message: 'Internal server error',
        });
      }
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private canAccessFile(upload: any, user: any): boolean {
    // PUBLIC files are accessible to everyone
    if (upload.visibility === Visibility.PUBLIC) {
      return true;
    }

    // If no user, only PUBLIC files are accessible
    if (!user) {
      return false;
    }

    // Admin/Super Admin can access all files
    if (user.role?.name === 'Admin' || user.role?.name === 'Super Admin') {
      return true;
    }

    // PRIVATE files are accessible only to uploader and admins
    if (upload.visibility === Visibility.PRIVATE) {
      return upload.uploadedById === user.id;
    }

    // ROLE_BASED files check if user's role is in allowedRoles
    if (upload.visibility === Visibility.ROLE_BASED) {
      return upload.allowedRoles.includes(user.roleId);
    }

    return false;
  }
}
