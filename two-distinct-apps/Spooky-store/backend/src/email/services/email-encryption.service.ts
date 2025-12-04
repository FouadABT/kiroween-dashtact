import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EmailEncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly tagLength = 16;
  private readonly saltLength = 64;

  private getEncryptionKey(): Buffer {
    const secret = process.env.EMAIL_ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
    return crypto.scryptSync(secret, 'salt', this.keyLength);
  }

  encrypt(text: string): string {
    try {
      const key = this.getEncryptionKey();
      const iv = crypto.randomBytes(this.ivLength);
      
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      // Combine iv + authTag + encrypted data
      return iv.toString('hex') + authTag.toString('hex') + encrypted;
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  decrypt(encryptedText: string): string {
    try {
      const key = this.getEncryptionKey();
      
      // Extract iv, authTag, and encrypted data
      const iv = Buffer.from(encryptedText.slice(0, this.ivLength * 2), 'hex');
      const authTag = Buffer.from(
        encryptedText.slice(this.ivLength * 2, (this.ivLength + this.tagLength) * 2),
        'hex',
      );
      const encrypted = encryptedText.slice((this.ivLength + this.tagLength) * 2);
      
      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  maskPassword(password: string): string {
    return '********';
  }
}
