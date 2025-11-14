import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { AuditLoggingService, AuditEventType } from './audit-logging.service';
import { authConfig } from '../../config/auth.config';

describe('AuditLoggingService', () => {
  let service: AuditLoggingService;
  let loggerSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuditLoggingService],
    }).compile();

    service = module.get<AuditLoggingService>(AuditLoggingService);

    // Spy on the specific logger instance methods
    const logger = (service as any).logger;
    loggerSpy = jest.spyOn(logger, 'log').mockImplementation();
    warnSpy = jest.spyOn(logger, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('logRegistration', () => {
    it('should log successful registration', () => {
      const email = 'test@example.com';
      const ipAddress = '127.0.0.1';
      const userAgent = 'Mozilla/5.0';

      service.logRegistration(email, true, ipAddress, userAgent);

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('[REGISTRATION_SUCCESS]'),
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining(`email=${email}`),
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining(`ip=${ipAddress}`),
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('success=true'),
      );
    });

    it('should log failed registration with error message', () => {
      const email = 'test@example.com';
      const errorMessage = 'Email already exists';

      service.logRegistration(email, false, undefined, undefined, errorMessage);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[REGISTRATION_FAILED]'),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining(`email=${email}`),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('success=false'),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining(`error="${errorMessage}"`),
      );
    });

    it('should not log when audit logging is disabled', () => {
      const originalValue = authConfig.security.enableAuditLogging;
      authConfig.security.enableAuditLogging = false;

      service.logRegistration('test@example.com', true);

      expect(loggerSpy).not.toHaveBeenCalled();
      expect(warnSpy).not.toHaveBeenCalled();

      authConfig.security.enableAuditLogging = originalValue;
    });
  });

  describe('logLogin', () => {
    it('should log successful login with user ID', () => {
      const email = 'test@example.com';
      const userId = 'user-123';
      const ipAddress = '127.0.0.1';

      service.logLogin(email, true, userId, ipAddress);

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('[LOGIN_SUCCESS]'),
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining(`userId=${userId}`),
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining(`email=${email}`),
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('success=true'),
      );
    });

    it('should log failed login without revealing which credential was wrong', () => {
      const email = 'test@example.com';
      const errorMessage = 'Invalid credentials';

      service.logLogin(
        email,
        false,
        undefined,
        undefined,
        undefined,
        errorMessage,
      );

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[LOGIN_FAILED]'),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('success=false'),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining(`error="${errorMessage}"`),
      );
    });
  });

  describe('logLogout', () => {
    it('should log logout event', () => {
      const userId = 'user-123';
      const email = 'test@example.com';
      const ipAddress = '127.0.0.1';

      service.logLogout(userId, email, ipAddress);

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('[LOGOUT]'),
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining(`userId=${userId}`),
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('success=true'),
      );
    });
  });

  describe('logTokenRefresh', () => {
    it('should log successful token refresh', () => {
      const userId = 'user-123';
      const ipAddress = '127.0.0.1';

      service.logTokenRefresh(userId, true, ipAddress);

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TOKEN_REFRESH]'),
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining(`userId=${userId}`),
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('success=true'),
      );
    });

    it('should log failed token refresh', () => {
      const userId = 'user-123';
      const errorMessage = 'Token expired';

      service.logTokenRefresh(
        userId,
        false,
        undefined,
        undefined,
        errorMessage,
      );

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TOKEN_REFRESH_FAILED]'),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('success=false'),
      );
    });
  });

  describe('logPermissionDenied', () => {
    it('should log permission denial with required permission', () => {
      const userId = 'user-123';
      const requiredPermission = 'users:write';
      const resource = '/users';
      const ipAddress = '127.0.0.1';

      service.logPermissionDenied(
        userId,
        requiredPermission,
        resource,
        ipAddress,
      );

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[PERMISSION_DENIED]'),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining(`userId=${userId}`),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining(`resource=${resource}`),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('success=false'),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          `metadata={"requiredPermission":"${requiredPermission}"}`,
        ),
      );
    });
  });

  describe('logRoleCheckFailed', () => {
    it('should log role check failure with role details', () => {
      const userId = 'user-123';
      const requiredRole = 'Admin';
      const userRole = 'User';
      const resource = '/admin';

      service.logRoleCheckFailed(userId, requiredRole, userRole, resource);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ROLE_CHECK_FAILED]'),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining(`userId=${userId}`),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('success=false'),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining(`"requiredRole":"${requiredRole}"`),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining(`"userRole":"${userRole}"`),
      );
    });
  });

  describe('logInvalidToken', () => {
    it('should log invalid token attempt', () => {
      const ipAddress = '127.0.0.1';

      service.logInvalidToken('invalid', ipAddress);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[INVALID_TOKEN]'),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('success=false'),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('error="Token invalid"'),
      );
    });

    it('should log expired token attempt', () => {
      service.logInvalidToken('expired');

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[EXPIRED_TOKEN]'),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('error="Token expired"'),
      );
    });

    it('should log blacklisted token attempt', () => {
      service.logInvalidToken('blacklisted');

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[BLACKLISTED_TOKEN]'),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('error="Token blacklisted"'),
      );
    });
  });

  describe('logRateLimitExceeded', () => {
    it('should log rate limit exceeded event', () => {
      const ipAddress = '127.0.0.1';
      const endpoint = '/auth/login';
      const userAgent = 'Mozilla/5.0';

      service.logRateLimitExceeded(ipAddress, endpoint, userAgent);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[RATE_LIMIT_EXCEEDED]'),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining(`ip=${ipAddress}`),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining(`resource=${endpoint}`),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('success=false'),
      );
    });
  });

  describe('logPasswordChanged', () => {
    it('should log password change event', () => {
      const userId = 'user-123';
      const email = 'test@example.com';
      const ipAddress = '127.0.0.1';

      service.logPasswordChanged(userId, email, ipAddress);

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('[PASSWORD_CHANGED]'),
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining(`userId=${userId}`),
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining(`email=${email}`),
      );
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('success=true'),
      );
    });
  });

  describe('getAuditStats', () => {
    it('should return audit logging status when enabled', () => {
      const originalValue = authConfig.security.enableAuditLogging;
      authConfig.security.enableAuditLogging = true;

      const stats = service.getAuditStats();

      expect(stats.enabled).toBe(true);
      expect(stats.message).toBe('Audit logging is enabled');

      authConfig.security.enableAuditLogging = originalValue;
    });

    it('should return audit logging status when disabled', () => {
      const originalValue = authConfig.security.enableAuditLogging;
      authConfig.security.enableAuditLogging = false;

      const stats = service.getAuditStats();

      expect(stats.enabled).toBe(false);
      expect(stats.message).toBe('Audit logging is disabled');

      authConfig.security.enableAuditLogging = originalValue;
    });
  });

  describe('log format', () => {
    it('should include timestamp in ISO format', () => {
      service.logLogin('test@example.com', true, 'user-123');

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringMatching(
          /timestamp=\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/,
        ),
      );
    });

    it('should include all provided fields in log entry', () => {
      const email = 'test@example.com';
      const userId = 'user-123';
      const ipAddress = '192.168.1.1';
      const userAgent = 'Mozilla/5.0';

      service.logLogin(email, true, userId, ipAddress, userAgent);

      const logCall = loggerSpy.mock.calls[0][0];
      expect(logCall).toContain(`userId=${userId}`);
      expect(logCall).toContain(`email=${email}`);
      expect(logCall).toContain(`ip=${ipAddress}`);
      expect(logCall).toContain('action=login');
      expect(logCall).toContain('success=true');
    });
  });
});
