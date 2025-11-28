'use client';

import React from 'react';
import { HeaderConfig, FooterConfig } from '@/types/landing-cms';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Menu, X } from 'lucide-react';

interface HeaderPreviewProps {
  config: HeaderConfig;
}

export function HeaderPreview({ config }: HeaderPreviewProps) {
  const logoSizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: config.style.transparent ? 'transparent' : config.style.background,
    boxShadow: config.style.shadow ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
  };

  return (
    <Card className="overflow-hidden">
      <div className="bg-muted/30 p-2 text-xs text-muted-foreground border-b border-border">
        Live Preview
      </div>
      <div style={headerStyle} className="p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex items-center">
            {config.logoLight ? (
              <img
                src={config.logoLight}
                alt="Logo"
                className={`${logoSizeClasses[config.logoSize]} object-contain`}
              />
            ) : (
              <div className="font-bold text-lg">Logo</div>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {config.navigation.slice(0, 5).map((item, index) => (
              <div key={index} className="text-sm font-medium hover:opacity-70 cursor-pointer">
                {item.label}
                {(item.type === 'dropdown' || item.type === 'mega-menu') && (
                  <span className="ml-1">▾</span>
                )}
              </div>
            ))}
          </nav>

          {/* CTAs */}
          <div className="hidden md:flex items-center gap-2">
            {config.ctas.map((cta, index) => {
              const buttonClasses = {
                primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
                secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
                outline: 'border border-border hover:bg-accent',
              };
              return (
                <Button
                  key={index}
                  size="sm"
                  className={buttonClasses[cta.style]}
                  variant={cta.style === 'outline' ? 'outline' : 'default'}
                >
                  {cta.text}
                </Button>
              );
            })}
          </div>

          {/* Mobile Menu Icon */}
          {config.mobileMenu.enabled && (
            <div className="md:hidden">
              {config.mobileMenu.iconStyle === 'hamburger' && <Menu className="h-6 w-6" />}
              {config.mobileMenu.iconStyle === 'dots' && <span className="text-2xl">⋮</span>}
              {config.mobileMenu.iconStyle === 'menu' && (
                <span className="text-sm font-medium">Menu</span>
              )}
            </div>
          )}
        </div>

        {/* Sticky Indicator */}
        {config.style.sticky && (
          <div className="text-xs text-center text-muted-foreground mt-2">
            Sticky: {config.style.stickyBehavior.replace(/-/g, ' ')}
          </div>
        )}
      </div>
    </Card>
  );
}

interface FooterPreviewProps {
  config: FooterConfig;
}

export function FooterPreview({ config }: FooterPreviewProps) {
  const footerStyle: React.CSSProperties = {
    backgroundColor: config.style.background,
    color: config.style.textColor,
    borderTop: config.style.borderTop ? `1px solid ${config.style.textColor}20` : 'none',
  };

  const currentYear = new Date().getFullYear();
  const copyrightText = config.copyright
    .replace('{year}', currentYear.toString())
    .replace('{brand}', 'Your Brand');

  return (
    <Card className="overflow-hidden">
      <div className="bg-muted/30 p-2 text-xs text-muted-foreground border-b border-border">
        Live Preview
      </div>
      <div style={footerStyle} className="p-8">
        {/* Layout: Multi-Column */}
        {config.layout === 'multi-column' && (
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              {config.columns.slice(0, 4).map((column, index) => (
                <div key={index}>
                  <h4 className="font-semibold mb-3 text-sm">{column.heading}</h4>
                  {column.type === 'links' && (
                    <ul className="space-y-2">
                      {(column.links || []).slice(0, 5).map((link, linkIndex) => (
                        <li key={linkIndex}>
                          <a
                            href={link.link}
                            className="text-sm opacity-80 hover:opacity-100"
                          >
                            {link.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                  {column.type === 'text' && (
                    <p className="text-sm opacity-80">{column.text}</p>
                  )}
                  {column.type === 'contact' && (
                    <div className="text-sm opacity-80 whitespace-pre-line">{column.text}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Newsletter */}
            {config.newsletter.enabled && (
              <div className="mb-8 max-w-md">
                <h4 className="font-semibold mb-3 text-sm">{config.newsletter.title}</h4>
                <div className="flex gap-2">
                  <Input
                    placeholder={config.newsletter.placeholder}
                    className="flex-1"
                    style={{ backgroundColor: `${config.style.textColor}10` }}
                  />
                  <Button size="sm">{config.newsletter.buttonText}</Button>
                </div>
              </div>
            )}

            {/* Social Links */}
            {config.social.length > 0 && (
              <div className="flex gap-4 mb-8">
                {config.social.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    className="opacity-80 hover:opacity-100"
                    title={social.platform}
                  >
                    <div className="w-8 h-8 rounded-full bg-current opacity-20 flex items-center justify-center">
                      <span className="text-xs">{social.platform[0].toUpperCase()}</span>
                    </div>
                  </a>
                ))}
              </div>
            )}

            {/* Copyright and Legal */}
            <div className="pt-8 border-t border-current opacity-20">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-sm opacity-60">{copyrightText}</p>
                {config.legalLinks.length > 0 && (
                  <div className="flex gap-4">
                    {config.legalLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link.link}
                        className="text-sm opacity-60 hover:opacity-100"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Layout: Single Column */}
        {config.layout === 'single' && (
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {config.columns.map((column, index) => (
              <div key={index}>
                <h4 className="font-semibold mb-2 text-sm">{column.heading}</h4>
                {column.type === 'links' && (
                  <div className="flex flex-wrap justify-center gap-4">
                    {(column.links || []).map((link, linkIndex) => (
                      <a
                        key={linkIndex}
                        href={link.link}
                        className="text-sm opacity-80 hover:opacity-100"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                )}
                {column.type === 'text' && <p className="text-sm opacity-80">{column.text}</p>}
              </div>
            ))}

            {config.social.length > 0 && (
              <div className="flex justify-center gap-4">
                {config.social.map((social, index) => (
                  <a key={index} href={social.url} className="opacity-80 hover:opacity-100">
                    <div className="w-8 h-8 rounded-full bg-current opacity-20" />
                  </a>
                ))}
              </div>
            )}

            <p className="text-sm opacity-60">{copyrightText}</p>
          </div>
        )}

        {/* Layout: Centered */}
        {config.layout === 'centered' && (
          <div className="max-w-2xl mx-auto text-center space-y-8">
            {config.newsletter.enabled && (
              <div>
                <h4 className="font-semibold mb-3">{config.newsletter.title}</h4>
                <div className="flex gap-2 max-w-md mx-auto">
                  <Input
                    placeholder={config.newsletter.placeholder}
                    className="flex-1"
                    style={{ backgroundColor: `${config.style.textColor}10` }}
                  />
                  <Button size="sm">{config.newsletter.buttonText}</Button>
                </div>
              </div>
            )}

            {config.social.length > 0 && (
              <div className="flex justify-center gap-4">
                {config.social.map((social, index) => (
                  <a key={index} href={social.url} className="opacity-80 hover:opacity-100">
                    <div className="w-8 h-8 rounded-full bg-current opacity-20" />
                  </a>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm opacity-60">{copyrightText}</p>
              {config.legalLinks.length > 0 && (
                <div className="flex justify-center gap-4">
                  {config.legalLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.link}
                      className="text-sm opacity-60 hover:opacity-100"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Layout: Split */}
        {config.layout === 'split' && (
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                {config.columns.slice(0, 2).map((column, index) => (
                  <div key={index} className="mb-6">
                    <h4 className="font-semibold mb-3 text-sm">{column.heading}</h4>
                    {column.type === 'text' && <p className="text-sm opacity-80">{column.text}</p>}
                  </div>
                ))}
              </div>
              <div>
                {config.newsletter.enabled && (
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3 text-sm">{config.newsletter.title}</h4>
                    <div className="flex gap-2">
                      <Input
                        placeholder={config.newsletter.placeholder}
                        className="flex-1"
                        style={{ backgroundColor: `${config.style.textColor}10` }}
                      />
                      <Button size="sm">{config.newsletter.buttonText}</Button>
                    </div>
                  </div>
                )}
                {config.social.length > 0 && (
                  <div className="flex gap-4">
                    {config.social.map((social, index) => (
                      <a key={index} href={social.url} className="opacity-80 hover:opacity-100">
                        <div className="w-8 h-8 rounded-full bg-current opacity-20" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-8 border-t border-current opacity-20">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-sm opacity-60">{copyrightText}</p>
                {config.legalLinks.length > 0 && (
                  <div className="flex gap-4">
                    {config.legalLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link.link}
                        className="text-sm opacity-60 hover:opacity-100"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
