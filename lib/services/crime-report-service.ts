import { CrimeReport, CrimeReportRequest } from '../types/crime-report';
import { DatabaseService } from './database-service';
import { CrimeAnalysisWorkflow } from './crime-analysis-workflow';

export class CrimeReportService {
  private database: DatabaseService;
  private aiWorkflow: CrimeAnalysisWorkflow;

  constructor() {
    this.database = new DatabaseService();
    this.aiWorkflow = new CrimeAnalysisWorkflow();
  }

  async submitReport(request: CrimeReportRequest, userId: string): Promise<CrimeReport> {
    try {
      // 1. Create the crime report in database
      const crimeReport = await this.database.createCrimeReport(request, userId);
      
      // 2. Execute AI analysis workflow
      console.log('Starting AI analysis for report:', crimeReport.id);
      const aiResult = await this.aiWorkflow.execute(crimeReport);
      
      // 3. Update the report with AI analysis results
      if (aiResult && aiResult.aiAnalysis) {
        console.log('AI analysis completed, updating report with results');
        const updatedReport = await this.database.updateCrimeReport(crimeReport.id, {
          aiAnalysis: {
            confidence: aiResult.aiAnalysis.confidence || 0,
            crimeType: aiResult.aiAnalysis.crimeType || 'Analysis Completed',
            severity: aiResult.aiAnalysis.severity || 'LOW',
            description: aiResult.aiAnalysis.description || 'AI analysis completed',
            riskFactors: aiResult.aiAnalysis.riskFactors || [],
            recommendations: aiResult.aiAnalysis.recommendations || [],
            extractedEntities: aiResult.aiAnalysis.extractedEntities || {
              people: [],
              vehicles: [],
              weapons: [],
              locations: [],
              objects: []
            }
          }
        });
        
        if (updatedReport) {
          console.log('Report updated successfully with AI analysis');
          return updatedReport;
        }
      }
      
      // 4. If AI analysis fails, return the original report
      console.log('AI analysis failed or incomplete, returning original report');
      return crimeReport;
      
    } catch (error) {
      console.error('Error in submitReport:', error);
      
      // If AI workflow fails, still create the report but with pending analysis
      try {
        const crimeReport = await this.database.createCrimeReport(request, userId);
        console.log('Report created without AI analysis due to workflow failure');
        return crimeReport;
      } catch (dbError) {
        console.error('Failed to create crime report:', dbError);
        throw new Error('Failed to submit crime report');
      }
    }
  }

  async getAllReports(): Promise<CrimeReport[]> {
    return this.database.getAllCrimeReports();
  }

  async getReportById(id: string): Promise<CrimeReport | null> {
    return this.database.getCrimeReportById(id);
  }

  async verifyReport(
    reportId: string, 
    adminId: string, 
    isVerified: boolean, 
    notes: string
  ): Promise<CrimeReport | null> {
    return this.database.verifyCrimeReport(reportId, adminId, isVerified, notes);
  }

  async getReportsByStatus(status: string): Promise<CrimeReport[]> {
    return this.database.getReportsByStatus(status);
  }

  async getReportsByPriority(priority: string): Promise<CrimeReport[]> {
    return this.database.getReportsByPriority(priority);
  }

  async getReportsByCategory(category: string): Promise<CrimeReport[]> {
    return this.database.getReportsByCategory(category);
  }

  async searchReports(query: string): Promise<CrimeReport[]> {
    return this.database.searchReports(query);
  }
}
