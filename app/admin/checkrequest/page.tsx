"use client";

import { useState, useEffect } from 'react';
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
  Users,
  Car,
  MapPin,
  Calendar,
  FileText,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import { CrimeReport, AdminDashboardStats } from '@/lib/types/crime-report';

export default function AdminCheckRequestPage() {
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

  useEffect(() => {
    fetchReports();
    fetchStats();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reports, filters]);

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/admin/verify');
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
      const response = await fetch('/api/admin/stats');
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
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportId: selectedReport.id,
          adminId: 'admin_user', // In production, get from auth
          isVerified: verificationData.isVerified,
          notes: verificationData.notes
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Report ${verificationData.isVerified ? 'verified' : 'rejected'} successfully`);
        fetchReports(); // Refresh the list
        setSelectedReport(null);
        setVerificationData({ isVerified: false, notes: '' });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error verifying report:', error);
      toast.error('Failed to verify report');
    }
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">
          Review and verify crime reports submitted by users
        </p>
      </div>

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

                                  {/* AI Insights */}
                                  {selectedReport.aiAnalysis.riskFactors.length > 0 && (
                                    <div>
                                      <h3 className="font-semibold mb-2">Risk Factors</h3>
                                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                        {selectedReport.aiAnalysis.riskFactors.map((factor, index) => (
                                          <li key={index}>{factor}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Verification Form */}
                                  <div className="border-t pt-4">
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
            {/* Category Breakdown */}
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

            {/* Priority Breakdown */}
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
