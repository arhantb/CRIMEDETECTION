"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Shield,
  MapPin,
  Calendar,
  BarChart3,
  LogOut,
  Wallet
} from 'lucide-react';
import { toast } from 'sonner';
import { CrimeReport, AdminDashboardStats } from '@/lib/types/crime-report';
import { useAdminAuth } from '@/hooks/use-admin-auth';

import { ConnectionProvider, WalletProvider, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import '@solana/wallet-adapter-react-ui/styles.css';

export default function AdminCheckRequestPage() {
  return (
    <ConnectionProvider endpoint={clusterApiUrl('devnet')}>
      <WalletProvider wallets={[new UnsafeBurnerWalletAdapter()]} autoConnect>
        <WalletModalProvider>
          <AdminDashboardContent />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

function AdminDashboardContent() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, logout } = useAdminAuth();
  const [reports, setReports] = useState<CrimeReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<CrimeReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<CrimeReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<AdminDashboardStats>({
    totalReports: 0,
    pendingVerification: 0,
    verifiedReports: 0,
    rejectedReports: 0,
    averageResponseTime: 0,
    reportsByCategory: {},
    reportsByPriority: {}
  });

  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all',
    search: ''
  });

  const [verificationData, setVerificationData] = useState({
    isVerified: false,
    notes: ''
  });

  const [showSolReward, setShowSolReward] = useState(false);
  const [rewardAmount, setRewardAmount] = useState('0.1');

  const { connection } = useConnection();
  const wallet = useWallet();
  const [airdropPublicKey, setAirdropPublicKey] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchReports();
      fetchStats();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    applyFilters();
  }, [reports, filters]);

  // Automatically set user public key from selected report
  useEffect(() => {
    if (selectedReport?.userPublicKey) {
      setAirdropPublicKey(selectedReport.userPublicKey);
    } else {
      setAirdropPublicKey('');
    }
  }, [selectedReport]);

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/admin/verify?admin_token=admin');
      const data = await response.json();
      
      if (data.success) {
        setReports(data.reports);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to fetch reports');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats?admin_token=admin');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...reports];

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(r => r.status === filters.status);
    }
    if (filters.priority && filters.priority !== 'all') {
      filtered = filtered.filter(r => r.priority === filters.priority);
    }
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(r => r.category === filters.category);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(r => 
        r.description.toLowerCase().includes(searchLower) ||
        r.location.toLowerCase().includes(searchLower) ||
        r.category.toLowerCase().includes(searchLower)
      );
    }

    setFilteredReports(filtered);
  };

  const handleVerification = async () => {
    if (!selectedReport) return;

    try {
      const response = await fetch('/api/admin/verify?admin_token=admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportId: selectedReport.id,
          adminId: 'admin_user',
          isVerified: verificationData.isVerified,
          notes: verificationData.notes
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response not ok:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (data.success) {
        toast.success(`Report ${verificationData.isVerified ? 'verified' : 'rejected'} successfully`);
        
        if (verificationData.isVerified && wallet.connected) {
          setShowSolReward(true);
        } else {
          fetchReports();
          setSelectedReport(null);
          setVerificationData({ isVerified: false, notes: '' });
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error verifying report:', error);
      toast.error('Failed to verify report');
    }
  };

  const requestAirdrop = async () => {
    try {
      const pubKey = new PublicKey(airdropPublicKey);
      const signature = await connection.requestAirdrop(pubKey, 0.3 * LAMPORTS_PER_SOL);
      await connection.confirmTransaction(signature);
      toast.success('0.3 SOL airdropped successfully!');
      setAirdropPublicKey('');
    } catch (error) {
      console.error('Airdrop error:', error);
      toast.error('Airdrop failed. Please check the public key and try again.');
    }
  };

  const sendRewardToUser = async (userPublicKey: string) => {
    try {
      const pubKey = new PublicKey(userPublicKey);
      const amount = parseFloat(rewardAmount) * LAMPORTS_PER_SOL;
      const signature = await connection.requestAirdrop(pubKey, amount);
      await connection.confirmTransaction(signature);
      toast.success(`${rewardAmount} SOL reward sent successfully!`);
      
      setShowSolReward(false);
      setSelectedReport(null);
      setVerificationData({ isVerified: false, notes: '' });
      setRewardAmount('0.1');
      fetchReports();
    } catch (error) {
      console.error('Reward sending error:', error);
      toast.error('Failed to send reward. Please check the public key and try again.');
    }
  };

  const skipReward = () => {
    setShowSolReward(false);
    setSelectedReport(null);
    setVerificationData({ isVerified: false, notes: '' });
    setRewardAmount('0.1');
    fetchReports();
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return variants[priority as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">
            Review and verify crime reports submitted by users
          </p>
        </div>
        <div className="flex items-center gap-4">
          <WalletMultiButton />
          {wallet.connected && <WalletDisconnectButton />}
          <Button onClick={logout} variant="outline" className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Solana Airdrop Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Solana Devnet Airdrop
          </CardTitle>
          <CardDescription>
            Send 0.3 SOL to users on Solana devnet for testing purposes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="airdrop-key">User's Public Key</Label>
              <Input
                id="airdrop-key"
                placeholder="Enter Solana public key (e.g., 11111111111111111111111111111111)"
                value={airdropPublicKey}
                onChange={(e) => setAirdropPublicKey(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
            <Button 
              onClick={requestAirdrop} 
              disabled={!airdropPublicKey.trim() || !wallet.connected}
              className="min-w-[140px]"
            >
              Send 0.3 SOL
            </Button>
          </div>
          {!wallet.connected && (
            <Alert className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please connect your wallet to send airdrops.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalReports}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingVerification}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-green-600">{stats.verifiedReports}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejectedReports}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="reports" className="space-y-6">
        <TabsList>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search reports..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={filters.priority}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All priorities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={filters.category}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {Object.keys(stats.reportsByCategory)
                        .filter(category => category && category.trim() !== '')
                        .map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reports List */}
          <Card>
            <CardHeader>
              <CardTitle>Crime Reports ({filteredReports.length})</CardTitle>
              <CardDescription>
                Review and verify submitted crime reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredReports.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No reports found matching the current filters.
                  </div>
                ) : (
                  filteredReports.map((report) => (
                    <div
                      key={report.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <Badge className={getStatusBadge(report.status)}>
                              {report.status}
                            </Badge>
                            <Badge className={getPriorityBadge(report.priority)}>
                              {report.priority}
                            </Badge>
                            <Badge variant="outline">
                              {report.category}
                            </Badge>
                          </div>

                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {report.description.length > 100 
                                ? `${report.description.substring(0, 100)}...` 
                                : report.description
                              }
                            </h3>
                            <p className="text-sm text-gray-600">
                              <MapPin className="h-3 w-3 inline mr-1" />
                              {report.location}
                            </p>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>
                              <Calendar className="h-3 w-3 inline mr-1" />
                              {formatDate(report.timestamp)}
                            </span>
                            <span>
                              <Shield className="h-3 w-3 inline mr-1" />
                              AI Confidence: {report.aiAnalysis.confidence}%
                            </span>
                          </div>

                          {report.aiAnalysis.confidence > 0 && (
                            <div className="text-sm text-gray-600">
                              <p><strong>AI Analysis:</strong> {report.aiAnalysis.crimeType}</p>
                              <p><strong>Severity:</strong> {report.aiAnalysis.severity}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedReport(report)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Crime Report Details</DialogTitle>
                                <DialogDescription>
                                  Review the report and provide verification
                                </DialogDescription>
                              </DialogHeader>

                              {selectedReport && (
                                <div className="space-y-6">
                                  {/* Media Display */}
                                  <div>
                                    <h3 className="font-semibold mb-2">Media Evidence</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                      {selectedReport.mediaUrls.map((url, index) => (
                                        <div key={index} className="aspect-square rounded-lg overflow-hidden border">
                                          {selectedReport.mediaType === 'video' ? (
                                            <video
                                              src={`data:video/mp4;base64,${url}`}
                                              className="w-full h-full object-cover"
                                              controls
                                            />
                                          ) : (
                                            <img
                                              src={`data:image/jpeg;base64,${url}`}
                                              alt={`Evidence ${index + 1}`}
                                              className="w-full h-full object-cover"
                                            />
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Report Details */}
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h3 className="font-semibold mb-2">Report Information</h3>
                                      <div className="space-y-2 text-sm">
                                        <p><strong>Location:</strong> {selectedReport.location}</p>
                                        <p><strong>Category:</strong> {selectedReport.category}</p>
                                        <p><strong>Priority:</strong> {selectedReport.priority}</p>
                                        <p><strong>Submitted:</strong> {formatDate(selectedReport.timestamp)}</p>
                                      </div>
                                    </div>

                                    <div>
                                      <h3 className="font-semibold mb-2">AI Analysis</h3>
                                      <div className="space-y-2 text-sm">
                                        <p><strong>Crime Type:</strong> {selectedReport.aiAnalysis.crimeType}</p>
                                        <p><strong>Confidence:</strong> {selectedReport.aiAnalysis.confidence}%</p>
                                        <p><strong>Severity:</strong> {selectedReport.aiAnalysis.severity}</p>
                                        <p><strong>Status:</strong> {selectedReport.status}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Description */}
                                  <div>
                                    <h3 className="font-semibold mb-2">Description</h3>
                                    <p className="text-sm text-gray-700">{selectedReport.description}</p>
                                  </div>

                                  {/* Verification Form */}
                                  <div className="border-t pt-4">
                                    {!showSolReward ? (
                                      <>
                                        <h3 className="font-semibold mb-4">Verification Decision</h3>
                                        <div className="space-y-4">
                                          <div className="flex items-center gap-4">
                                            <Button
                                              variant={verificationData.isVerified ? "default" : "outline"}
                                              onClick={() => setVerificationData(prev => ({ ...prev, isVerified: true }))}
                                              className="flex-1"
                                            >
                                              <CheckCircle className="h-4 w-4 mr-2" />
                                              Verify Report
                                            </Button>
                                            <Button
                                              variant={!verificationData.isVerified ? "destructive" : "outline"}
                                              onClick={() => setVerificationData(prev => ({ ...prev, isVerified: false }))}
                                              className="flex-1"
                                            >
                                              <XCircle className="h-4 w-4 mr-2" />
                                              Reject Report
                                            </Button>
                                          </div>

                                          <div>
                                            <Label htmlFor="notes">Notes</Label>
                                            <Textarea
                                              id="notes"
                                              placeholder="Provide reasoning for your decision..."
                                              value={verificationData.notes}
                                              onChange={(e) => setVerificationData(prev => ({ ...prev, notes: e.target.value }))}
                                              rows={3}
                                            />
                                          </div>

                                          <div className="flex justify-end gap-2">
                                            <Button
                                              variant="outline"
                                              onClick={() => {
                                                setSelectedReport(null);
                                                setVerificationData({ isVerified: false, notes: '' });
                                              }}
                                            >
                                              Cancel
                                            </Button>
                                            <Button
                                              onClick={handleVerification}
                                              disabled={!verificationData.notes.trim()}
                                            >
                                              Submit Decision
                                            </Button>
                                          </div>
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <h3 className="font-semibold mb-4 text-green-600">🎉 Report Verified Successfully!</h3>
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                          <p className="text-sm text-green-800 mb-2">
                                            Great job! This report has been verified. Would you like to send a SOL reward to the user?
                                          </p>
                                          <p className="text-xs text-green-600">
                                            Rewarding users encourages more quality reports and community engagement.
                                          </p>
                                        </div>

                                        <div className="space-y-4">
                                          <div>
                                            <Label htmlFor="reward-amount">Reward Amount (SOL)</Label>
                                            <Select 
                                              value={rewardAmount} 
                                              onValueChange={setRewardAmount}
                                            >
                                              <SelectTrigger>
                                                <SelectValue placeholder="Select reward amount" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="0.05">0.05 SOL (~$2)</SelectItem>
                                                <SelectItem value="0.1">0.1 SOL (~$4)</SelectItem>
                                                <SelectItem value="0.2">0.2 SOL (~$8)</SelectItem>
                                                <SelectItem value="0.5">0.5 SOL (~$20)</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>

                                          <div>
                                            <Label htmlFor="user-wallet">User's Wallet Address</Label>
                                            {/* Read-only display of userPublicKey */}
                                            <Input
                                              id="user-wallet"
                                              value={airdropPublicKey}
                                            className="font-mono text-sm bg-gray-100 cursor-not-allowed"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                              Automatically filled from the report submission
                                            </p>
                                          </div>

                                          <div className="flex justify-end gap-2">
                                            <Button
                                              variant="outline"
                                              onClick={skipReward}
                                            >
                                              Skip Reward
                                            </Button>
                                            <Button
                                              onClick={() => sendRewardToUser(airdropPublicKey)}
                                              disabled={!airdropPublicKey.trim() || !wallet.connected}
                                              className="bg-green-600 hover:bg-green-700"
                                            >
                                              <Wallet className="h-4 w-4 mr-2" />
                                              Send {rewardAmount} SOL Reward
                                            </Button>
                                          </div>

                                          {!wallet.connected && (
                                            <Alert>
                                              <AlertTriangle className="h-4 w-4" />
                                              <AlertDescription>
                                                Please connect your wallet to send rewards.
                                              </AlertDescription>
                                            </Alert>
                                          )}
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              )}

                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <Card>
              <CardHeader>
                <CardTitle>Reports by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(stats.reportsByCategory).map(([category, count]) => (
                    <div key={category} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{category}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reports by Priority</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(stats.reportsByPriority).map(([priority, count]) => (
                    <div key={priority} className="flex justify-between items-center">
                      <span className="text-sm font-medium capitalize">{priority}</span>
                      <Badge className={getPriorityBadge(priority)}>{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
