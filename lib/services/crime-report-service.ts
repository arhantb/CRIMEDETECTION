import { CrimeReport, CrimeReportRequest, AIAnalysis } from '../types/crime-report';
import { CrimeAnalysisWorkflow } from './crime-analysis-workflow';
import { DatabaseService } from './database-service';

export class CrimeReportService {
  private database: DatabaseService;
  private workflow: CrimeAnalysisWorkflow;

  constructor() {
    this.database = new DatabaseService();
    this.workflow = new CrimeAnalysisWorkflow();
  }

  async submitReport(request: CrimeReportRequest, userId: string): Promise<CrimeReport> {
    try {
      // For now, skip file processing on server side
      // In production, this would be handled by a file upload service
      const mediaUrls: string[] = [];
      
      // Create initial crime report in database
      const savedReport = await this.database.createCrimeReport(request, userId);

      // Process through AI workflow
      this.processReportAsync(savedReport.id);

      return savedReport;
    } catch (error) {
      console.error('Error submitting crime report:', error);
      throw new Error('Failed to submit crime report');
    }
  }



  private async processReportAsync(reportId: string): Promise<void> {
    try {
      const report = await this.database.getCrimeReportById(reportId);
      if (!report) return;

      // Execute the AI workflow
      const workflowResult = await this.workflow.execute(report);

      // Update the report with AI analysis results
      await this.database.updateCrimeReport(reportId, {
        aiAnalysis: workflowResult.aiAnalysis,
        status: workflowResult.finalDecision === 'verified' ? 'verified' : 'pending'
      });

      console.log(`Report ${reportId} processed with status: ${workflowResult.finalDecision}`);
    } catch (error) {
      console.error(`Error processing report ${reportId}:`, error);
      // In production, implement retry logic and error handling
    }
  }

  async getReport(id: string): Promise<CrimeReport | null> {
    return this.database.getCrimeReportById(id);
  }

  async getAllReports(): Promise<CrimeReport[]> {
    return this.database.getAllCrimeReports();
  }

  async getPendingReports(): Promise<CrimeReport[]> {
    return this.database.getReportsByStatus('pending');
  }

  async verifyReport(
    reportId: string, 
    adminId: string, 
    isVerified: boolean, 
    notes: string
  ): Promise<CrimeReport | null> {
    return this.database.verifyCrimeReport(reportId, adminId, isVerified, notes);
  }

  async getReportsByStatus(status: CrimeReport['status']): Promise<CrimeReport[]> {
    return this.database.getReportsByStatus(status);
  }

  async getReportsByPriority(priority: CrimeReport['priority']): Promise<CrimeReport[]> {
    return this.database.getReportsByPriority(priority);
  }

  async getReportsByCategory(category: string): Promise<CrimeReport[]> {
    return this.database.getReportsByCategory(category);
  }

  async searchReports(query: string): Promise<CrimeReport[]> {
    return this.database.searchReports(query);
  }
}
