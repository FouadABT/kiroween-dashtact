'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Eye,
  AlertCircle,
  CheckCircle,
  Info,
  Palette,
  Type,
  FileText,
  Keyboard,
} from 'lucide-react';
import {
  validateAltText,
  validateHeadingHierarchy,
  validateFormAccessibility,
  calculateContrastRatio,
  calculateAccessibilityScore,
  type AccessibilityIssue,
} from '@/lib/accessibility-utils';

interface AccessibilityCheckerProps {
  content?: {
    images?: { src: string; alt: string }[];
    headings?: { level: number; text: string }[];
    forms?: { inputs: { id?: string; label?: string; required?: boolean }[] }[];
  };
  onIssuesFound?: (issues: AccessibilityIssue[]) => void;
}

export function AccessibilityChecker({ content, onIssuesFound }: AccessibilityCheckerProps) {
  const [issues, setIssues] = useState<AccessibilityIssue[]>([]);
  const [score, setScore] = useState<number>(100);
  const [foregroundColor, setForegroundColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');

  const runAccessibilityCheck = () => {
    const allIssues: AccessibilityIssue[] = [];

    // Check alt text
    if (content?.images) {
      content.images.forEach((image) => {
        const issue = validateAltText(image.alt);
        if (issue) {
          allIssues.push({ ...issue, element: image.src });
        }
      });
    }

    // Check heading hierarchy
    if (content?.headings) {
      const headingIssues = validateHeadingHierarchy(content.headings);
      allIssues.push(...headingIssues);
    }

    // Check form accessibility
    if (content?.forms) {
      content.forms.forEach((form) => {
        const formIssues = validateFormAccessibility(form);
        allIssues.push(...formIssues);
      });
    }

    setIssues(allIssues);
    const accessibilityScore = calculateAccessibilityScore(allIssues);
    setScore(accessibilityScore);
    onIssuesFound?.(allIssues);
  };

  const contrastResult = calculateContrastRatio(foregroundColor, backgroundColor);

  const getIssueIcon = (type: AccessibilityIssue['type']) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getCategoryIcon = (category: AccessibilityIssue['category']) => {
    switch (category) {
      case 'alt-text':
        return <Eye className="h-4 w-4" />;
      case 'contrast':
        return <Palette className="h-4 w-4" />;
      case 'heading':
        return <Type className="h-4 w-4" />;
      case 'form':
        return <FileText className="h-4 w-4" />;
      case 'keyboard':
        return <Keyboard className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const issuesByCategory = issues.reduce((acc, issue) => {
    if (!acc[issue.category]) {
      acc[issue.category] = [];
    }
    acc[issue.category].push(issue);
    return acc;
  }, {} as Record<string, AccessibilityIssue[]>);

  return (
    <div className="space-y-6">
      {/* Accessibility Score */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Accessibility Score</h3>
          </div>
          <Button onClick={runAccessibilityCheck} variant="outline" size="sm">
            Run Check
          </Button>
        </div>

        <div className="flex items-center justify-center mb-4">
          <div className="text-center">
            <div className={`text-6xl font-bold ${score >= 90 ? 'text-green-600' : score >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
              {score}
            </div>
            <Badge variant={score >= 90 ? 'default' : score >= 70 ? 'secondary' : 'destructive'} className="mt-2">
              {score >= 90 ? 'Excellent' : score >= 70 ? 'Good' : 'Needs Work'}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-red-600">
              {issues.filter((i) => i.type === 'error').length}
            </div>
            <div className="text-xs text-muted-foreground">Errors</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {issues.filter((i) => i.type === 'warning').length}
            </div>
            <div className="text-xs text-muted-foreground">Warnings</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {issues.filter((i) => i.type === 'info').length}
            </div>
            <div className="text-xs text-muted-foreground">Info</div>
          </div>
        </div>
      </Card>

      {/* Accessibility Tools */}
      <Card className="p-6">
        <Tabs defaultValue="contrast">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="contrast">Contrast Checker</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
          </TabsList>

          <TabsContent value="contrast" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="foreground">Foreground Color</Label>
                <div className="flex space-x-2">
                  <Input
                    id="foreground"
                    type="color"
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className="w-16 h-10"
                  />
                  <Input
                    type="text"
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="background">Background Color</Label>
                <div className="flex space-x-2">
                  <Input
                    id="background"
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-16 h-10"
                  />
                  <Input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div
              className="p-6 rounded-lg border"
              style={{ backgroundColor, color: foregroundColor }}
            >
              <p className="text-lg font-semibold mb-2">Sample Text</p>
              <p className="text-sm">This is how your text will look with the selected colors.</p>
            </div>

            {/* Contrast Results */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Contrast Ratio:</span>
                <span className="text-2xl font-bold">{contrastResult.ratio}:1</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">WCAG AA</span>
                  {contrastResult.passes.aa ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                </div>

                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">WCAG AAA</span>
                  {contrastResult.passes.aaa ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                </div>

                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">AA Large</span>
                  {contrastResult.passes.aaLarge ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                </div>

                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">AAA Large</span>
                  {contrastResult.passes.aaaLarge ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="issues" className="space-y-4">
            {issues.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <p className="text-muted-foreground">No accessibility issues found!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(issuesByCategory).map(([category, categoryIssues]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(category as AccessibilityIssue['category'])}
                      <h4 className="font-semibold capitalize">{category.replace('-', ' ')}</h4>
                      <Badge variant="secondary">{categoryIssues.length}</Badge>
                    </div>

                    {categoryIssues.map((issue, index) => (
                      <div key={index} className="flex items-start space-x-2 p-3 bg-muted rounded-lg">
                        {getIssueIcon(issue.type)}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{issue.message}</p>
                          {issue.element && (
                            <p className="text-xs text-muted-foreground mt-1">Element: {issue.element}</p>
                          )}
                          {issue.suggestion && (
                            <p className="text-xs text-blue-600 mt-1">💡 {issue.suggestion}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
