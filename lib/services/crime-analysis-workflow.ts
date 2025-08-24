import { StateGraph, END } from '@langchain/langgraph';
import { GeminiService } from './gemini-service';
import { CrimeReport, AIAnalysis, HumanVerification } from '../types/crime-report';

interface WorkflowState {
  crimeReport: CrimeReport;
  aiAnalysis: AIAnalysis;
  humanVerification?: HumanVerification;
  currentStep: string;
  requiresHumanReview: boolean;
  finalDecision: 'verified' | 'rejected' | 'pending';
}

export class CrimeAnalysisWorkflow {
  private geminiService: GeminiService;
  private workflow: StateGraph<WorkflowState>;

  constructor() {
    this.geminiService = new GeminiService();
    this.workflow = this.createWorkflow();
  }

  private createWorkflow(): StateGraph<WorkflowState> {
    const workflow = new StateGraph<WorkflowState>({
      channels: {
        crimeReport: { value: null },
        aiAnalysis: { value: null },
        humanVerification: { value: null },
        currentStep: { value: 'initial' },
        requiresHumanReview: { value: false },
        finalDecision: { value: 'pending' }
      }
    });

    // Add nodes
    workflow.addNode('analyzeMedia', this.analyzeMedia.bind(this));
    workflow.addNode('assessRisk', this.assessRisk.bind(this));
    workflow.addNode('determineReview', this.determineReview.bind(this));
    workflow.addNode('humanReview', this.humanReview.bind(this));
    workflow.addNode('finalizeDecision', this.finalizeDecision.bind(this));

    // Add edges
    workflow.addEdge('analyzeMedia', 'assessRisk');
    workflow.addEdge('assessRisk', 'determineReview');
    
    // Conditional edge based on risk assessment
    workflow.addConditionalEdges(
      'determineReview',
      this.shouldRequireHumanReview.bind(this),
      {
        'human_review': 'humanReview',
        'auto_approve': 'finalizeDecision'
      }
    );
    
    workflow.addEdge('humanReview', 'finalizeDecision');
    workflow.addEdge('finalizeDecision', END);

    // Set entry point
    workflow.setEntryPoint('analyzeMedia');

    return workflow;
  }

  private async analyzeMedia(state: WorkflowState): Promise<Partial<WorkflowState>> {
    const { crimeReport } = state;
    
    try {
      let aiAnalysis: AIAnalysis;
      
      if (crimeReport.mediaType === 'video') {
        aiAnalysis = await this.geminiService.analyzeVideo(
          crimeReport.mediaUrls[0], // Assuming first video for now
          crimeReport.description
        );
      } else {
        aiAnalysis = await this.geminiService.analyzeImage(
          crimeReport.mediaUrls[0], // Assuming first image for now
          crimeReport.description
        );
      }

      return {
        aiAnalysis,
        currentStep: 'media_analyzed'
      };
    } catch (error) {
      console.error('Error in media analysis:', error);
      return {
        aiAnalysis: this.getDefaultAnalysis(),
        currentStep: 'media_analysis_failed'
      };
    }
  }

  private async assessRisk(state: WorkflowState): Promise<Partial<WorkflowState>> {
    const { aiAnalysis } = state;
    
    // Enhance risk assessment based on AI analysis
    const enhancedAnalysis = {
      ...aiAnalysis,
      riskFactors: [
        ...aiAnalysis.riskFactors,
        this.calculateAdditionalRiskFactors(aiAnalysis)
      ].filter(Boolean),
      recommendations: [
        ...aiAnalysis.recommendations,
        this.generateRiskBasedRecommendations(aiAnalysis)
      ].filter(Boolean)
    };

    return {
      aiAnalysis: enhancedAnalysis,
      currentStep: 'risk_assessed'
    };
  }

  private async determineReview(state: WorkflowState): Promise<Partial<WorkflowState>> {
    const { aiAnalysis } = state;
    
    // Determine if human review is required based on:
    // 1. Confidence level
    // 2. Severity level
    // 3. Risk factors
    const requiresReview = 
      aiAnalysis.confidence < 70 ||
      aiAnalysis.severity === 'high' ||
      aiAnalysis.severity === 'critical' ||
      aiAnalysis.riskFactors.length > 3;

    return {
      requiresHumanReview: requiresReview,
      currentStep: 'review_determined'
    };
  }

  private async humanReview(state: WorkflowState): Promise<Partial<WorkflowState>> {
    // This node represents the human verification step
    // In a real implementation, this would wait for human input
    // For now, we'll simulate it with a placeholder
    return {
      currentStep: 'human_review_completed',
      humanVerification: {
        verifiedBy: 'admin_user',
        verifiedAt: new Date(),
        isVerified: true,
        notes: 'Automatically approved for demonstration',
        confidence: 95,
        requiresFollowUp: false
      }
    };
  }

  private async finalizeDecision(state: WorkflowState): Promise<Partial<WorkflowState>> {
    const { humanVerification, aiAnalysis, requiresHumanReview } = state;
    
    let finalDecision: 'verified' | 'rejected' | 'pending';
    
    if (!requiresHumanReview) {
      // Auto-approve based on AI confidence
      finalDecision = aiAnalysis.confidence >= 80 ? 'verified' : 'pending';
    } else if (humanVerification) {
      finalDecision = humanVerification.isVerified ? 'verified' : 'rejected';
    } else {
      finalDecision = 'pending';
    }

    return {
      finalDecision,
      currentStep: 'decision_finalized'
    };
  }

  private shouldRequireHumanReview(state: WorkflowState): string {
    return state.requiresHumanReview ? 'human_review' : 'auto_approve';
  }

  private calculateAdditionalRiskFactors(analysis: AIAnalysis): string[] {
    const factors: string[] = [];
    
    if (analysis.extractedEntities.weapons.length > 0) {
      factors.push('Weapons detected in media');
    }
    
    if (analysis.extractedEntities.people.length > 5) {
      factors.push('Large number of people involved');
    }
    
    if (analysis.confidence < 60) {
      factors.push('Low AI confidence requires verification');
    }
    
    return factors;
  }

  private generateRiskBasedRecommendations(analysis: AIAnalysis): string[] {
    const recommendations: string[] = [];
    
    if (analysis.severity === 'critical') {
      recommendations.push('Immediate law enforcement response required');
    }
    
    if (analysis.extractedEntities.weapons.length > 0) {
      recommendations.push('Armed response team recommended');
    }
    
    if (analysis.confidence < 70) {
      recommendations.push('Additional evidence collection needed');
    }
    
    return recommendations;
  }

  private getDefaultAnalysis(): AIAnalysis {
    return {
      confidence: 0,
      crimeType: 'Unknown',
      severity: 'low',
      description: 'Analysis failed - manual review required',
      riskFactors: ['Manual review needed'],
      recommendations: ['Requires human verification'],
      extractedEntities: {
        people: [],
        vehicles: [],
        weapons: [],
        locations: [],
        objects: []
      }
    };
  }

  async execute(crimeReport: CrimeReport): Promise<WorkflowState> {
    const initialState: WorkflowState = {
      crimeReport,
      aiAnalysis: this.getDefaultAnalysis(),
      currentStep: 'initial',
      requiresHumanReview: false,
      finalDecision: 'pending'
    };

    try {
      const result = await this.workflow.invoke(initialState);
      return result;
    } catch (error) {
      console.error('Workflow execution failed:', error);
      return {
        ...initialState,
        currentStep: 'workflow_failed',
        finalDecision: 'pending'
      };
    }
  }
}
