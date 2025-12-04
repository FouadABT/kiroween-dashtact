/**
 * Email System Seed Data
 *
 * This file defines default permissions and templates for the email system.
 */

export interface EmailPermissionDefinition {
  name: string;
  resource: string;
  action: string;
  description: string;
}

export interface EmailTemplateDefinition {
  name: string;
  slug: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  variables: string[]; // Array of variable names
  category: string;
}

/**
 * Email system permissions
 */
export const EMAIL_PERMISSIONS: EmailPermissionDefinition[] = [
  {
    name: 'email:configure',
    resource: 'email',
    action: 'configure',
    description: 'Configure SMTP settings and email system',
  },
  {
    name: 'email:send',
    resource: 'email',
    action: 'send',
    description: 'Send emails through the system',
  },
  {
    name: 'email:view_logs',
    resource: 'email',
    action: 'view_logs',
    description: 'View email delivery logs and statistics',
  },
  {
    name: 'email:manage_templates',
    resource: 'email',
    action: 'manage_templates',
    description: 'Create, edit, and delete email templates',
  },
  {
    name: 'email:*',
    resource: 'email',
    action: '*',
    description: 'All email system operations',
  },
];

/**
 * Default email templates
 */
export const DEFAULT_EMAIL_TEMPLATES: EmailTemplateDefinition[] = [
  {
    name: 'Welcome Email',
    slug: 'welcome-email',
    subject: 'Welcome to {{appName}}!',
    htmlBody: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to {{appName}}!</h1>
          </div>
          <div class="content">
            <p>Hi {{userName}},</p>
            <p>Thank you for joining {{appName}}! We're excited to have you on board.</p>
            <p>Your account has been successfully created and you can now access all features.</p>
            <a href="{{loginUrl}}" class="button">Get Started</a>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Best regards,<br>The {{appName}} Team</p>
          </div>
          <div class="footer">
            <p>&copy; {{year}} {{appName}}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    textBody: `Welcome to {{appName}}!

Hi {{userName}},

Thank you for joining {{appName}}! We're excited to have you on board.

Your account has been successfully created and you can now access all features.

Get started: {{loginUrl}}

If you have any questions, feel free to reach out to our support team.

Best regards,
The {{appName}} Team

© {{year}} {{appName}}. All rights reserved.`,
    variables: ['appName', 'userName', 'loginUrl', 'year'],
    category: 'USER_ACTION',
  },
  {
    name: 'Password Reset',
    slug: 'password-reset',
    subject: 'Reset Your Password - {{appName}}',
    htmlBody: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Password Reset Request</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>Hi {{userName}},</p>
          
          <p>We received a request to reset your password for your {{appName}} account. If you didn't make this request, you can safely ignore this email.</p>
          
          <p>To reset your password, click the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{resetUrl}}" style="background: #667eea; color: white; padding: 14px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="background: white; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px;">{{resetUrl}}</p>
          
          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <p style="margin: 0; font-weight: bold;">⚠️ Security Notice</p>
            <p style="margin: 5px 0 0 0; font-size: 14px;">This link will expire in {{expiresIn}}. For security reasons, it can only be used once.</p>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">If you didn't request a password reset, please contact our support team immediately at <a href="mailto:{{supportEmail}}">{{supportEmail}}</a></p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #999; text-align: center;">This is an automated email from {{appName}}. Please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `,
    textBody: `Hi {{userName}},

We received a request to reset your password for your {{appName}} account.

To reset your password, visit this link:
{{resetUrl}}

This link will expire in {{expiresIn}} and can only be used once.

If you didn't request a password reset, you can safely ignore this email or contact support at {{supportEmail}}.

---
This is an automated email from {{appName}}.`,
    variables: ['userName', 'resetUrl', 'expiresIn', 'appName', 'supportEmail'],
    category: 'SECURITY',
  },
  {
    name: 'Notification Digest',
    slug: 'notification-digest',
    subject: 'Your Daily Digest - {{appName}}',
    htmlBody: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10B981; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .notification { background-color: white; padding: 15px; margin: 10px 0; border-left: 4px solid #10B981; }
          .button { display: inline-block; padding: 12px 24px; background-color: #10B981; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Daily Digest</h1>
          </div>
          <div class="content">
            <p>Hi {{userName}},</p>
            <p>Here's your daily summary of notifications from {{appName}}:</p>
            <div class="notification">
              <strong>{{notificationCount}} new notifications</strong>
              <p>{{notificationSummary}}</p>
            </div>
            <a href="{{dashboardUrl}}" class="button">View Dashboard</a>
            <p>To manage your notification preferences, visit your account settings.</p>
            <p>Best regards,<br>The {{appName}} Team</p>
          </div>
          <div class="footer">
            <p>&copy; {{year}} {{appName}}. All rights reserved.</p>
            <p><a href="{{unsubscribeUrl}}" style="color: #666;">Unsubscribe from digest emails</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
    textBody: `Your Daily Digest

Hi {{userName}},

Here's your daily summary of notifications from {{appName}}:

{{notificationCount}} new notifications
{{notificationSummary}}

View Dashboard: {{dashboardUrl}}

To manage your notification preferences, visit your account settings.

Best regards,
The {{appName}} Team

© {{year}} {{appName}}. All rights reserved.
Unsubscribe: {{unsubscribeUrl}}`,
    variables: ['appName', 'userName', 'notificationCount', 'notificationSummary', 'dashboardUrl', 'unsubscribeUrl', 'year'],
    category: 'SYSTEM',
  },
  {
    name: 'System Alert',
    slug: 'system-alert',
    subject: '[ALERT] {{alertTitle}} - {{appName}}',
    htmlBody: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #F59E0B; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .alert { background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 24px; background-color: #F59E0B; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ System Alert</h1>
          </div>
          <div class="content">
            <p>Hi {{userName}},</p>
            <div class="alert">
              <h2>{{alertTitle}}</h2>
              <p>{{alertMessage}}</p>
            </div>
            <p><strong>Time:</strong> {{alertTime}}</p>
            <p><strong>Severity:</strong> {{alertSeverity}}</p>
            <a href="{{actionUrl}}" class="button">Take Action</a>
            <p>If you need assistance, please contact our support team immediately.</p>
            <p>Best regards,<br>The {{appName}} Team</p>
          </div>
          <div class="footer">
            <p>&copy; {{year}} {{appName}}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    textBody: `⚠️ SYSTEM ALERT

Hi {{userName}},

{{alertTitle}}

{{alertMessage}}

Time: {{alertTime}}
Severity: {{alertSeverity}}

Take Action: {{actionUrl}}

If you need assistance, please contact our support team immediately.

Best regards,
The {{appName}} Team

© {{year}} {{appName}}. All rights reserved.`,
    variables: ['appName', 'userName', 'alertTitle', 'alertMessage', 'alertTime', 'alertSeverity', 'actionUrl', 'year'],
    category: 'SYSTEM',
  },
  {
    name: 'Two-Factor Verification Code',
    slug: 'two-factor-verification',
    subject: 'Your Verification Code - {{appName}}',
    htmlBody: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Verification Code</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">🔐 Verification Code</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>Hi {{userName}},</p>
          
          <p>You requested a verification code to complete your login to {{appName}}.</p>
          
          <div style="background: white; padding: 30px; text-align: center; margin: 30px 0; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Your verification code is:</p>
            <h1 style="margin: 0; font-size: 48px; letter-spacing: 12px; color: #667eea; font-weight: bold;">{{code}}</h1>
          </div>
          
          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <p style="margin: 0; font-weight: bold;">⚠️ Security Notice</p>
            <p style="margin: 5px 0 0 0; font-size: 14px;">
              • This code will expire in {{expiresIn}}<br>
              • Do not share this code with anyone<br>
              • If you didn't request this code, please contact support immediately
            </p>
          </div>
          
          <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <p style="margin: 0; font-weight: bold;">📍 Login Attempt Details</p>
            <p style="margin: 5px 0 0 0; font-size: 14px;">
              IP Address: {{ipAddress}}
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #999; text-align: center;">This is an automated security email from {{appName}}. Please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `,
    textBody: `Hi {{userName}},

You requested a verification code to complete your login to {{appName}}.

Your verification code is: {{code}}

⚠️ SECURITY NOTICE:
• This code will expire in {{expiresIn}}
• Do not share this code with anyone
• If you didn't request this code, please contact support immediately

Login Attempt Details:
IP Address: {{ipAddress}}

---
This is an automated security email from {{appName}}.`,
    variables: ['code', 'userName', 'expiresIn', 'ipAddress', 'appName'],
    category: 'SECURITY',
  },
];
