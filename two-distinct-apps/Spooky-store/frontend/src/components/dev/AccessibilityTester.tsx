'use client';

"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { runAccessibilityTests, generateAccessibilityReport, AccessibilityTestResult } from '@/utils/accessibility-test';

/**
 * Props for the AccessibilityTester component
 */
export interface AccessibilityTesterProps {
  /** Optional callback when tests complete */
  onTestComplete?: (results: AccessibilityTestResult[]) => void;
  /** Optional custom test configurations */
  testConfig?: {
    includeRecommendations?: boolean;
    autoRun?: boolean;
  };
}

export function AccessibilityTester(_props?: AccessibilityTesterProps) {
  const [testResults, setTestResults] = useState<AccessibilityTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    
    // Simulate async testing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const results = runAccessibilityTests();
    setTestResults(results);
    setIsRunning(false);
  };

  const downloadReport = () => {
    const report = generateAccessibilityReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'accessibility-report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const passedTests = testResults.filter(r => r.passed).length;
  const totalTests = testResults.length;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Accessibility Testing Dashboard</CardTitle>
        <CardDescription>
          Test the accessibility features of the dashboard components
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            onClick={runTests} 
            disabled={isRunning}
            aria-label="Run accessibility tests"
          >
            {isRunning ? 'Running Tests...' : 'Run Accessibility Tests'}
          </Button>
          
          {testResults.length > 0 && (
            <Button 
              variant="outline" 
              onClick={downloadReport}
              aria-label="Download accessibility report"
            >
              Download Report
            </Button>
          )}
        </div>

        {testResults.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Test Results</h3>
              <Badge variant={passedTests === totalTests ? "default" : "destructive"}>
                {passedTests}/{totalTests} Passed
              </Badge>
            </div>

            <div className="grid gap-4">
              {testResults.map((result, index) => (
                <Card key={index} className={`border-l-4 ${
                  result.passed ? 'border-l-green-500' : 'border-l-red-500'
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{result.component}</CardTitle>
                      <Badge variant={result.passed ? "default" : "destructive"}>
                        {result.passed ? '✅ Passed' : '❌ Failed'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {result.issues.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-red-600 mb-2">Issues Found:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-red-600">
                          {result.issues.map((issue, i) => (
                            <li key={i}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {result.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-medium text-blue-600 mb-2">Recommendations:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-blue-600">
                          {result.recommendations.map((rec, i) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Accessibility Features Implemented:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
            <li>Proper ARIA labels and roles for navigation and interactive elements</li>
            <li>Keyboard navigation support with focus management</li>
            <li>Screen reader compatibility with semantic markup</li>
            <li>Skip to main content link for keyboard users</li>
            <li>Form validation with accessible error messages</li>
            <li>Table accessibility with proper headers and navigation</li>
            <li>Focus indicators for all interactive elements</li>
            <li>Live regions for dynamic content updates</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
