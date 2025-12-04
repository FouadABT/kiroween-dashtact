'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  Zap,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from 'lucide-react';
import {
  measureWebVitals,
  calculatePerformanceScore,
  type PerformanceMetrics,
} from '@/lib/performance-utils';

interface PerformanceMonitorProps {
  onOptimizationSuggestion?: (suggestions: string[]) => void;
}

export function PerformanceMonitor({ onOptimizationSuggestion }: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [score, setScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const measurePerformance = async () => {
    setLoading(true);
    try {
      const webVitals = await measureWebVitals();
      setMetrics(webVitals);
      
      const perfScore = calculatePerformanceScore(webVitals);
      setScore(perfScore);
      
      // Generate suggestions
      const newSuggestions = generateSuggestions(webVitals);
      setSuggestions(newSuggestions);
      onOptimizationSuggestion?.(newSuggestions);
    } catch (error) {
      console.error('Failed to measure performance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    measurePerformance();
  }, []);

  const generateSuggestions = (metrics: PerformanceMetrics): string[] => {
    const suggestions: string[] = [];
    
    if (metrics.fcp > 1800) {
      suggestions.push('Optimize First Contentful Paint by reducing render-blocking resources');
    }
    if (metrics.lcp > 2500) {
      suggestions.push('Improve Largest Contentful Paint by optimizing images and lazy loading');
    }
    if (metrics.ttfb > 600) {
      suggestions.push('Reduce Time to First Byte by optimizing server response time');
    }
    if (metrics.cls > 0.1) {
      suggestions.push('Minimize Cumulative Layout Shift by setting image dimensions');
    }
    
    if (suggestions.length === 0) {
      suggestions.push('Performance is excellent! No optimizations needed.');
    }
    
    return suggestions;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number): { variant: 'default' | 'secondary' | 'destructive'; label: string } => {
    if (score >= 90) return { variant: 'default', label: 'Excellent' };
    if (score >= 50) return { variant: 'secondary', label: 'Good' };
    return { variant: 'destructive', label: 'Needs Improvement' };
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Measuring performance...</span>
        </div>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Unable to measure performance</p>
          <Button onClick={measurePerformance} className="mt-4">
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  const scoreBadge = getScoreBadge(score);

  return (
    <div className="space-y-6">
      {/* Performance Score */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Performance Score</h3>
          </div>
          <Button onClick={measurePerformance} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        <div className="flex items-center justify-center mb-4">
          <div className="text-center">
            <div className={`text-6xl font-bold ${getScoreColor(score)}`}>
              {score}
            </div>
            <Badge variant={scoreBadge.variant} className="mt-2">
              {scoreBadge.label}
            </Badge>
          </div>
        </div>
        
        <Progress value={score} className="h-2" />
      </Card>

      {/* Core Web Vitals */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Core Web Vitals</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* FCP */}
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded">
              <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">First Contentful Paint</span>
                {metrics.fcp < 1800 ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                )}
              </div>
              <div className="text-2xl font-bold">{metrics.fcp.toFixed(0)}ms</div>
              <div className="text-xs text-muted-foreground">Target: &lt; 1800ms</div>
            </div>
          </div>

          {/* LCP */}
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded">
              <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Largest Contentful Paint</span>
                {metrics.lcp < 2500 ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                )}
              </div>
              <div className="text-2xl font-bold">{metrics.lcp.toFixed(0)}ms</div>
              <div className="text-xs text-muted-foreground">Target: &lt; 2500ms</div>
            </div>
          </div>

          {/* TTFB */}
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded">
              <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Time to First Byte</span>
                {metrics.ttfb < 600 ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                )}
              </div>
              <div className="text-2xl font-bold">{metrics.ttfb.toFixed(0)}ms</div>
              <div className="text-xs text-muted-foreground">Target: &lt; 600ms</div>
            </div>
          </div>

          {/* CLS */}
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded">
              <Activity className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cumulative Layout Shift</span>
                {metrics.cls < 0.1 ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                )}
              </div>
              <div className="text-2xl font-bold">{metrics.cls.toFixed(3)}</div>
              <div className="text-xs text-muted-foreground">Target: &lt; 0.1</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Optimization Suggestions */}
      {suggestions.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Optimization Suggestions</h3>
          <ul className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="mt-0.5">
                  {suggestion.includes('excellent') ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  )}
                </div>
                <span className="text-sm">{suggestion}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
