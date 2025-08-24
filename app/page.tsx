"use client";

import { useUser, SignInButton, SignOutButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Camera, Users, BarChart3, AlertTriangle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function HomePage() {
  const { isSignedIn, user, isLoaded } = useUser();
  const pathname = usePathname();

  const navItems = [
    {
      href: '/',
      label: 'Home',
      icon: Shield
    },
    {
      href: '/report',
      label: 'Report Crime',
      icon: AlertTriangle
    },
    {
      href: '/admin/checkrequest',
      label: 'Admin Panel',
      icon: BarChart3
    },
    {
      href: '/test-ai',
      label: 'Test AI',
      icon: BarChart3
    },
    {
      href: '/predictions',
      label: 'Predictions',
      icon: BarChart3
    }
  ];

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Crime Detection AI</h1>
          </div>
          <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`flex items-center space-x-2 ${
                        isActive 
                          ? "bg-blue-600 text-white" 
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>
          
          <div className="flex items-center space-x-4">
            {isSignedIn ? (
              <div className="flex items-center space-x-4">
                                 <div className="text-sm text-gray-600">
                   Welcome, <span className="font-semibold">{user.firstName || user.emailAddresses[0]?.emailAddress}</span>
                 </div>
                 <Badge variant="secondary">
                   user
                 </Badge>
                <SignOutButton>
                  <Button variant="outline">Sign Out</Button>
                </SignOutButton>
              </div>
            ) : (
              <SignInButton>
                <Button>Sign In</Button>
              </SignInButton>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {isSignedIn ? (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="text-center">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome to AI-Powered Crime Detection
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Report crimes with AI analysis and human verification. Help keep your community safe 
                with our advanced detection system.
              </p>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Report Crime Card */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <Camera className="h-6 w-6 text-red-600" />
                  </div>
                  <CardTitle>Report a Crime</CardTitle>
                  <CardDescription>
                    Submit photos/videos with AI analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/report">
                    <Button className="w-full" size="lg">
                      Report Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>

                             {/* Admin Panel Card */}
               <Card className="hover:shadow-lg transition-shadow">
                 <CardHeader className="text-center">
                   <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                     <Users className="h-6 w-6 text-blue-600" />
                   </div>
                   <CardTitle>Admin Panel</CardTitle>
                   <CardDescription>
                     Review and verify crime reports
                   </CardDescription>
                 </CardHeader>
                 <CardContent>
                   <Link href="/admin/login">
                     <Button className="w-full" size="lg" variant="outline">
                       Access Admin Panel
                     </Button>
                   </Link>
                 </CardContent>
               </Card>

              {/* Dashboard Card */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <BarChart3 className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle>View Reports</CardTitle>
                  <CardDescription>
                    Check status of your reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/reports">
                    <Button className="w-full" size="lg" variant="outline">
                      View Reports
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Features Section */}
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                How It Works
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Camera className="h-8 w-8 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">1. Upload Evidence</h4>
                  <p className="text-gray-600">
                    Take photos or videos of suspicious activities and provide detailed descriptions.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle className="h-8 w-8 text-purple-600" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">2. AI Analysis</h4>
                  <p className="text-gray-600">
                    Our AI analyzes the media content for potential threats and criminal activity.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2">3. Human Verification</h4>
                  <p className="text-gray-600">
                    Trained administrators review and verify reports before taking action.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Sign In Prompt */
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Shield className="h-12 w-12 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Join Crime Detection AI
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Sign in to report crimes, access AI analysis, and help keep your community safe. 
              Your reports are analyzed by advanced AI and verified by human experts.
            </p>
            <SignInButton>
              <Button size="lg" className="text-lg px-8 py-4">
                Get Started - Sign In
              </Button>
            </SignInButton>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2024 Crime Detection AI. Powered by Next.js, Prisma, and Google Gemini AI.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            In case of emergency, contact local law enforcement immediately.
          </p>
        </div>
      </footer>
    </div>
  );
}
