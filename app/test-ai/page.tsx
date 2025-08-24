"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function TestAIPage() {
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testAIWorkflow = async () => {
    setIsLoading(true);
    try {
      // Create a test crime report
      const testReport = {
        location: 'Test Location',
        description: 'Test suspicious activity',
        mediaFiles: [],
        category: 'Test Category',
        priority: 'medium' as const
      };

      const response = await fetch('/api/report', {
        method: 'POST',
        body: JSON.stringify(testReport),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      setTestResult(result);
      
      if (response.ok) {
        toast.success('Test report submitted successfully!');
      } else {
        toast.error('Test failed: ' + result.error);
      }
    } catch (error) {
      console.error('Test error:', error);
      toast.error('Test failed with error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Test AI Workflow</CardTitle>
          <CardDescription>
            Test if the AI analysis workflow is working properly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={testAIWorkflow} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Testing...' : 'Test AI Workflow'}
          </Button>

          {testResult && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <h3 className="font-semibold mb-2">Test Result:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
