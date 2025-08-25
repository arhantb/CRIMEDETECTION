"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut } from 'lucide-react';

export default function GiftPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gift Page</h1>
        <Button variant="outline" onClick={() => router.push('/admin/login')}>
          <LogOut className="h-4 w-4 mr-2" /> Logout
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Congratulations!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">
            The report has been successfully verified and submitted. You can now proceed with any further actions on this page.
          </p>

          <div className="mt-4">
            <Button onClick={() => router.push('/admin/check-requests')}>
              Back to Admin Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
