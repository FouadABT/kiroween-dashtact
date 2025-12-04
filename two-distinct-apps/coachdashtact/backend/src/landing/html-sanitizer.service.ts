import { Injectable } from '@nestjs/common';

@Injectable()
export class HtmlSanitizerService {
  sanitizeHtml(html: string): string {
    if (!html) return '';
    let sanitized = html;
    const dangerousPatterns = [
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<script[\s\S]*?<\/script>/gi,
      /<iframe[\s\S]*?<\/iframe>/gi,
      /<object[\s\S]*?<\/object>/gi,
      /<embed[\s\S]*?>/gi,
      /<link[\s\S]*?>/gi,
      /<meta[\s\S]*?>/gi,
    ];
    for (const pattern of dangerousPatterns) {
      sanitized = sanitized.replace(pattern, '');
    }
    return sanitized;
  }

  sanitizeCss(css: string): string {
    if (!css) return '';
    let sanitized = css;
    const dangerousCssPatterns = [
      /javascript:/gi,
      /expression\s*\(/gi,
      /import\s+/gi,
      /@import/gi,
      /behavior\s*:/gi,
      /-moz-binding/gi,
    ];
    for (const pattern of dangerousCssPatterns) {
      sanitized = sanitized.replace(pattern, '');
    }
    return sanitized;
  }

  sanitizeContentSection(data: any): any {
    return {
      ...data,
      content: this.sanitizeHtml(data.content || ''),
      customCSS: this.sanitizeCss(data.customCSS || ''),
    };
  }
}
