'use client';

/**
 * Footer Section Editor
 * 
 * Edit footer section with nav/social links.
 */

import { FooterSectionData, NavLink, SocialLink } from '@/types/landing-page';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { PageSelector } from '../shared/PageSelector';

interface FooterSectionEditorProps {
  data: FooterSectionData;
  onChange: (data: FooterSectionData) => void;
}

export function FooterSectionEditor({ data, onChange }: FooterSectionEditorProps) {
  const handleChange = (field: keyof FooterSectionData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleAddNavLink = () => {
    const newLink: NavLink = {
      label: 'New Link',
      url: '/',
      linkType: 'url',
      order: data.navLinks.length,
    };
    handleChange('navLinks', [...data.navLinks, newLink]);
  };

  const handleUpdateNavLink = (index: number, field: keyof NavLink, value: any) => {
    const updated = [...data.navLinks];
    updated[index] = { ...updated[index], [field]: value };
    handleChange('navLinks', updated);
  };

  const handleDeleteNavLink = (index: number) => {
    handleChange('navLinks', data.navLinks.filter((_, i) => i !== index));
  };

  const handleAddSocialLink = () => {
    const newLink: SocialLink = {
      platform: 'twitter',
      url: 'https://twitter.com',
      icon: 'twitter',
    };
    handleChange('socialLinks', [...data.socialLinks, newLink]);
  };

  const handleUpdateSocialLink = (index: number, field: keyof SocialLink, value: any) => {
    const updated = [...data.socialLinks];
    updated[index] = { ...updated[index], [field]: value };
    handleChange('socialLinks', updated);
  };

  const handleDeleteSocialLink = (index: number) => {
    handleChange('socialLinks', data.socialLinks.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="company-name">Company Name</Label>
        <Input
          id="company-name"
          value={data.companyName}
          onChange={(e) => handleChange('companyName', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={data.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Navigation Links</Label>
          <Button onClick={handleAddNavLink} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Link
          </Button>
        </div>
        <div className="space-y-2">
          {data.navLinks.map((link, index) => (
            <Card key={index} className="p-3">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={link.label}
                    onChange={(e) => handleUpdateNavLink(index, 'label', e.target.value)}
                    placeholder="Label"
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteNavLink(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label>Link Type</Label>
                  <Select
                    value={link.linkType}
                    onValueChange={(value) => handleUpdateNavLink(index, 'linkType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="url">External URL</SelectItem>
                      <SelectItem value="page">Internal Page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {link.linkType === 'url' ? (
                  <Input
                    value={link.url}
                    onChange={(e) => handleUpdateNavLink(index, 'url', e.target.value)}
                    placeholder="https://example.com"
                  />
                ) : (
                  <PageSelector
                    value={link.url}
                    onChange={(slug) => handleUpdateNavLink(index, 'url', slug)}
                    placeholder="Select a page"
                  />
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Social Links</Label>
          <Button onClick={handleAddSocialLink} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Link
          </Button>
        </div>
        <div className="space-y-2">
          {data.socialLinks.map((link, index) => (
            <Card key={index} className="p-3">
              <div className="flex gap-2">
                <Input
                  value={link.platform}
                  onChange={(e) => handleUpdateSocialLink(index, 'platform', e.target.value)}
                  placeholder="Platform"
                  className="flex-1"
                />
                <Input
                  value={link.url}
                  onChange={(e) => handleUpdateSocialLink(index, 'url', e.target.value)}
                  placeholder="URL"
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteSocialLink(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="copyright">Copyright Text</Label>
        <Input
          id="copyright"
          value={data.copyright}
          onChange={(e) => handleChange('copyright', e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="show-newsletter">Show Newsletter Signup</Label>
        <Switch
          id="show-newsletter"
          checked={data.showNewsletter}
          onCheckedChange={(checked) => handleChange('showNewsletter', checked)}
        />
      </div>

      {data.showNewsletter && (
        <>
          <div className="space-y-2">
            <Label htmlFor="newsletter-title">Newsletter Title</Label>
            <Input
              id="newsletter-title"
              value={data.newsletterTitle || ''}
              onChange={(e) => handleChange('newsletterTitle', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newsletter-description">Newsletter Description</Label>
            <Textarea
              id="newsletter-description"
              value={data.newsletterDescription || ''}
              onChange={(e) => handleChange('newsletterDescription', e.target.value)}
              rows={2}
            />
          </div>
        </>
      )}
    </div>
  );
}
