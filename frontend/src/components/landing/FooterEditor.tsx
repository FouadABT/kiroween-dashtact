'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  FooterConfig,
  FooterColumn,
  SocialLink,
  LegalLink,
  FooterLink,
} from '@/types/landing-cms';
import {
  Plus,
  Trash2,
  GripVertical,
  Save,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Github,
  Youtube,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { FooterPreview } from './HeaderFooterPreview';

interface FooterEditorProps {
  config: FooterConfig;
  onChange: (config: FooterConfig) => void;
  onSave: () => Promise<void>;
  isSaving?: boolean;
}

export function FooterEditor({ config, onChange, onSave, isSaving = false }: FooterEditorProps) {
  const [activeTab, setActiveTab] = useState('layout');

  const updateConfig = (updates: Partial<FooterConfig>) => {
    onChange({ ...config, ...updates });
  };

  const handleSave = async () => {
    try {
      await onSave();
      toast.success('Footer configuration saved successfully');
    } catch (error) {
      toast.error('Failed to save footer configuration');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Footer Editor</h2>
          <p className="text-sm text-muted-foreground">Customize your site footer</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start border-b border-border rounded-none bg-background px-4">
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
          <TabsTrigger value="style">Style</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Live Preview */}
          <FooterPreview config={config} />

          {/* Layout Tab */}
          <TabsContent value="layout" className="mt-0 space-y-4">
            <LayoutTab config={config} onChange={updateConfig} />
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="mt-0 space-y-4">
            <ContentTab config={config} onChange={updateConfig} />
          </TabsContent>

          {/* Social Tab */}
          <TabsContent value="social" className="mt-0 space-y-4">
            <SocialTab config={config} onChange={updateConfig} />
          </TabsContent>

          {/* Newsletter Tab */}
          <TabsContent value="newsletter" className="mt-0 space-y-4">
            <NewsletterTab config={config} onChange={updateConfig} />
          </TabsContent>

          {/* Style Tab */}
          <TabsContent value="style" className="mt-0 space-y-4">
            <StyleTab config={config} onChange={updateConfig} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

// Layout Tab Component
function LayoutTab({
  config,
  onChange,
}: {
  config: FooterConfig;
  onChange: (updates: Partial<FooterConfig>) => void;
}) {
  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-base font-semibold mb-4">Footer Layout</h3>

        {/* Layout Style */}
        <div className="space-y-2 mb-6">
          <Label htmlFor="layout-style">Layout Style</Label>
          <Select
            value={config.layout}
            onValueChange={(value: FooterConfig['layout']) => onChange({ layout: value })}
          >
            <SelectTrigger id="layout-style">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single Column</SelectItem>
              <SelectItem value="multi-column">Multi-Column</SelectItem>
              <SelectItem value="centered">Centered</SelectItem>
              <SelectItem value="split">Split Layout</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Choose how your footer content is organized
          </p>
        </div>

        <Separator className="my-6" />

        {/* Layout Preview */}
        <div className="space-y-2">
          <Label>Layout Preview</Label>
          <div className="border border-border rounded-lg p-4 bg-muted/30">
            {config.layout === 'single' && (
              <div className="text-center text-sm text-muted-foreground">
                Single column layout - All content stacked vertically
              </div>
            )}
            {config.layout === 'multi-column' && (
              <div className="grid grid-cols-4 gap-4 text-sm text-muted-foreground">
                <div className="border border-dashed border-border p-2 rounded">Col 1</div>
                <div className="border border-dashed border-border p-2 rounded">Col 2</div>
                <div className="border border-dashed border-border p-2 rounded">Col 3</div>
                <div className="border border-dashed border-border p-2 rounded">Col 4</div>
              </div>
            )}
            {config.layout === 'centered' && (
              <div className="flex justify-center text-sm text-muted-foreground">
                <div className="border border-dashed border-border p-4 rounded w-1/2 text-center">
                  Centered content
                </div>
              </div>
            )}
            {config.layout === 'split' && (
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="border border-dashed border-border p-4 rounded">Left side</div>
                <div className="border border-dashed border-border p-4 rounded">Right side</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

// Content Tab Component
function ContentTab({
  config,
  onChange,
}: {
  config: FooterConfig;
  onChange: (updates: Partial<FooterConfig>) => void;
}) {
  const addColumn = () => {
    const newColumn: FooterColumn = {
      heading: 'New Section',
      type: 'links',
      links: [],
    };
    onChange({ columns: [...config.columns, newColumn] });
  };

  const updateColumn = (index: number, updates: Partial<FooterColumn>) => {
    const updated = [...config.columns];
    updated[index] = { ...updated[index], ...updates };
    onChange({ columns: updated });
  };

  const removeColumn = (index: number) => {
    onChange({ columns: config.columns.filter((_, i) => i !== index) });
  };

  const addLinkToColumn = (columnIndex: number) => {
    const column = config.columns[columnIndex];
    const newLink: FooterLink = { label: 'New Link', link: '/' };
    updateColumn(columnIndex, {
      links: [...(column.links || []), newLink],
    });
  };

  const updateLink = (columnIndex: number, linkIndex: number, updates: Partial<FooterLink>) => {
    const column = config.columns[columnIndex];
    const updatedLinks = [...(column.links || [])];
    updatedLinks[linkIndex] = { ...updatedLinks[linkIndex], ...updates };
    updateColumn(columnIndex, { links: updatedLinks });
  };

  const removeLink = (columnIndex: number, linkIndex: number) => {
    const column = config.columns[columnIndex];
    updateColumn(columnIndex, {
      links: (column.links || []).filter((_, i) => i !== linkIndex),
    });
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Footer Content</h3>
        <Button onClick={addColumn} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Column
        </Button>
      </div>

      <div className="space-y-4">
        {config.columns.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No columns yet</p>
            <p className="text-sm">Click "Add Column" to get started</p>
          </div>
        ) : (
          config.columns.map((column, columnIndex) => (
            <Card key={columnIndex} className="p-4 space-y-4">
              <div className="flex items-start gap-2">
                <Button variant="ghost" size="icon" className="cursor-move mt-1">
                  <GripVertical className="h-4 w-4" />
                </Button>
                <div className="flex-1 space-y-4">
                  {/* Column Header */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Heading</Label>
                      <Input
                        value={column.heading}
                        onChange={(e) => updateColumn(columnIndex, { heading: e.target.value })}
                        placeholder="Section Title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Content Type</Label>
                      <Select
                        value={column.type}
                        onValueChange={(value: FooterColumn['type']) =>
                          updateColumn(columnIndex, { type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="links">Navigation Links</SelectItem>
                          <SelectItem value="text">Text Block</SelectItem>
                          <SelectItem value="contact">Contact Info</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Links Type */}
                  {column.type === 'links' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Links</Label>
                        <Button
                          onClick={() => addLinkToColumn(columnIndex)}
                          size="sm"
                          variant="outline"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Link
                        </Button>
                      </div>
                      {(column.links || []).map((link, linkIndex) => (
                        <div key={linkIndex} className="flex gap-2">
                          <Input
                            value={link.label}
                            onChange={(e) =>
                              updateLink(columnIndex, linkIndex, { label: e.target.value })
                            }
                            placeholder="Label"
                            className="flex-1"
                          />
                          <Input
                            value={link.link}
                            onChange={(e) =>
                              updateLink(columnIndex, linkIndex, { link: e.target.value })
                            }
                            placeholder="/path"
                            className="flex-1"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeLink(columnIndex, linkIndex)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Text Type */}
                  {column.type === 'text' && (
                    <div className="space-y-2">
                      <Label>Text Content</Label>
                      <Textarea
                        value={column.text || ''}
                        onChange={(e) => updateColumn(columnIndex, { text: e.target.value })}
                        placeholder="Enter your text content..."
                        rows={4}
                      />
                    </div>
                  )}

                  {/* Contact Type */}
                  {column.type === 'contact' && (
                    <div className="space-y-2">
                      <Label>Contact Information</Label>
                      <Textarea
                        value={column.text || ''}
                        onChange={(e) => updateColumn(columnIndex, { text: e.target.value })}
                        placeholder="Email: contact@example.com&#10;Phone: +1 234 567 890&#10;Address: 123 Main St"
                        rows={4}
                      />
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeColumn(columnIndex)}
                  className="text-destructive hover:text-destructive mt-1"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      <Separator className="my-6" />

      {/* Copyright and Legal Links */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold">Copyright & Legal</h4>
        
        <div className="space-y-2">
          <Label htmlFor="copyright">Copyright Text</Label>
          <Input
            id="copyright"
            value={config.copyright}
            onChange={(e) => onChange({ copyright: e.target.value })}
            placeholder="© {year} {brand}. All rights reserved."
          />
          <p className="text-xs text-muted-foreground">
            Use {'{year}'} for current year and {'{brand}'} for brand name from <a href="/dashboard/settings/branding" className="text-primary hover:underline">Branding Settings</a>
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Legal Links</Label>
            <Button
              onClick={() => {
                const newLink: LegalLink = { label: 'Privacy Policy', link: '/privacy' };
                onChange({ legalLinks: [...config.legalLinks, newLink] });
              }}
              size="sm"
              variant="outline"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Link
            </Button>
          </div>
          {config.legalLinks.map((link, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={link.label}
                onChange={(e) => {
                  const updated = [...config.legalLinks];
                  updated[index] = { ...updated[index], label: e.target.value };
                  onChange({ legalLinks: updated });
                }}
                placeholder="Privacy Policy"
                className="flex-1"
              />
              <Input
                value={link.link}
                onChange={(e) => {
                  const updated = [...config.legalLinks];
                  updated[index] = { ...updated[index], link: e.target.value };
                  onChange({ legalLinks: updated });
                }}
                placeholder="/privacy"
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  onChange({ legalLinks: config.legalLinks.filter((_, i) => i !== index) });
                }}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

// Social Tab Component
function SocialTab({
  config,
  onChange,
}: {
  config: FooterConfig;
  onChange: (updates: Partial<FooterConfig>) => void;
}) {
  const socialPlatforms = [
    { value: 'facebook', label: 'Facebook', icon: Facebook },
    { value: 'twitter', label: 'Twitter', icon: Twitter },
    { value: 'instagram', label: 'Instagram', icon: Instagram },
    { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
    { value: 'github', label: 'GitHub', icon: Github },
    { value: 'youtube', label: 'YouTube', icon: Youtube },
  ];

  const addSocialLink = (platform: string) => {
    const newLink: SocialLink = {
      platform,
      url: '',
      icon: platform,
    };
    onChange({ social: [...config.social, newLink] });
  };

  const updateSocialLink = (index: number, updates: Partial<SocialLink>) => {
    const updated = [...config.social];
    updated[index] = { ...updated[index], ...updates };
    onChange({ social: updated });
  };

  const removeSocialLink = (index: number) => {
    onChange({ social: config.social.filter((_, i) => i !== index) });
  };

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-base font-semibold mb-4">Social Media Links</h3>
        <p className="text-xs text-muted-foreground mb-4">
          💡 Social links are automatically synced from <a href="/dashboard/settings/branding" className="text-primary hover:underline">Branding Settings</a>. Add links here to override branding.
        </p>

        {/* Add Social Platform */}
        <div className="space-y-3 mb-6">
          <Label>Add Social Platform</Label>
          <div className="grid grid-cols-3 gap-2">
            {socialPlatforms.map((platform) => {
              const Icon = platform.icon;
              const isAdded = config.social.some((s) => s.platform === platform.value);
              return (
                <Button
                  key={platform.value}
                  variant={isAdded ? 'secondary' : 'outline'}
                  onClick={() => !isAdded && addSocialLink(platform.value)}
                  disabled={isAdded}
                  className="justify-start"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {platform.label}
                </Button>
              );
            })}
          </div>
        </div>

        <Separator className="my-6" />

        {/* Social Links List */}
        <div className="space-y-3">
          <Label>Configured Links</Label>
          {config.social.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No social links yet</p>
              <p className="text-sm">Click a platform above to add it</p>
            </div>
          ) : (
            config.social.map((link, index) => {
              const platform = socialPlatforms.find((p) => p.value === link.platform);
              const Icon = platform?.icon || Facebook;
              return (
                <Card key={index} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <Label className="text-sm capitalize">{link.platform}</Label>
                        <Input
                          value={link.url}
                          onChange={(e) => updateSocialLink(index, { url: e.target.value })}
                          placeholder={`https://${link.platform}.com/yourprofile`}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSocialLink(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </Card>
  );
}

// Newsletter Tab Component
function NewsletterTab({
  config,
  onChange,
}: {
  config: FooterConfig;
  onChange: (updates: Partial<FooterConfig>) => void;
}) {
  const updateNewsletter = (updates: Partial<typeof config.newsletter>) => {
    onChange({ newsletter: { ...config.newsletter, ...updates } });
  };

  return (
    <Card className="p-6 space-y-6">
      <div>
        <h3 className="text-base font-semibold mb-4">Newsletter Signup</h3>

        {/* Enable Newsletter */}
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-0.5">
            <Label>Enable Newsletter Signup</Label>
            <p className="text-sm text-muted-foreground">
              Add email signup form to footer
            </p>
          </div>
          <Switch
            checked={config.newsletter.enabled}
            onCheckedChange={(checked) => updateNewsletter({ enabled: checked })}
          />
        </div>

        {config.newsletter.enabled && (
          <>
            <Separator className="my-6" />

            {/* Newsletter Title */}
            <div className="space-y-2">
              <Label htmlFor="newsletter-title">Title</Label>
              <Input
                id="newsletter-title"
                value={config.newsletter.title}
                onChange={(e) => updateNewsletter({ title: e.target.value })}
                placeholder="Subscribe to our newsletter"
              />
            </div>

            {/* Placeholder */}
            <div className="space-y-2">
              <Label htmlFor="newsletter-placeholder">Email Placeholder</Label>
              <Input
                id="newsletter-placeholder"
                value={config.newsletter.placeholder}
                onChange={(e) => updateNewsletter({ placeholder: e.target.value })}
                placeholder="Enter your email"
              />
            </div>

            {/* Button Text */}
            <div className="space-y-2">
              <Label htmlFor="newsletter-button">Button Text</Label>
              <Input
                id="newsletter-button"
                value={config.newsletter.buttonText}
                onChange={(e) => updateNewsletter({ buttonText: e.target.value })}
                placeholder="Subscribe"
              />
            </div>

            <Separator className="my-6" />

            {/* Preview */}
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="border border-border rounded-lg p-4 bg-muted/30">
                <p className="text-sm font-medium mb-3">{config.newsletter.title}</p>
                <div className="flex gap-2">
                  <Input
                    placeholder={config.newsletter.placeholder}
                    disabled
                    className="flex-1"
                  />
                  <Button disabled>{config.newsletter.buttonText}</Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

// Style Tab Component
function StyleTab({
  config,
  onChange,
}: {
  config: FooterConfig;
  onChange: (updates: Partial<FooterConfig>) => void;
}) {
  const updateStyle = (updates: Partial<typeof config.style>) => {
    onChange({ style: { ...config.style, ...updates } });
  };

  return (
    <Card className="p-6 space-y-6">
      <h3 className="text-base font-semibold">Footer Style</h3>

      {/* Background Color */}
      <div className="space-y-2">
        <Label htmlFor="footer-bg">Background Color</Label>
        <div className="flex gap-2">
          <Input
            id="footer-bg"
            type="color"
            value={config.style.background}
            onChange={(e) => updateStyle({ background: e.target.value })}
            className="w-20 h-10"
          />
          <Input
            type="text"
            value={config.style.background}
            onChange={(e) => updateStyle({ background: e.target.value })}
            placeholder="#000000"
          />
        </div>
      </div>

      {/* Text Color */}
      <div className="space-y-2">
        <Label htmlFor="footer-text">Text Color</Label>
        <div className="flex gap-2">
          <Input
            id="footer-text"
            type="color"
            value={config.style.textColor}
            onChange={(e) => updateStyle({ textColor: e.target.value })}
            className="w-20 h-10"
          />
          <Input
            type="text"
            value={config.style.textColor}
            onChange={(e) => updateStyle({ textColor: e.target.value })}
            placeholder="#ffffff"
          />
        </div>
      </div>

      <Separator />

      {/* Border Top */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Top Border</Label>
          <p className="text-sm text-muted-foreground">Add border line above footer</p>
        </div>
        <Switch
          checked={config.style.borderTop}
          onCheckedChange={(checked) => updateStyle({ borderTop: checked })}
        />
      </div>

      <Separator />

      {/* Preview */}
      <div className="space-y-2">
        <Label>Style Preview</Label>
        <div
          className="border rounded-lg p-6"
          style={{
            backgroundColor: config.style.background,
            color: config.style.textColor,
            borderTop: config.style.borderTop ? '1px solid currentColor' : 'none',
          }}
        >
          <div className="text-center">
            <p className="text-sm font-medium">Footer Preview</p>
            <p className="text-xs opacity-70 mt-1">This is how your footer will look</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
