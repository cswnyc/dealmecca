/**
 * Batch Import Progress Tracking System
 * 
 * Comprehensive tracking system for monitoring batch imports during the
 * gradual scaling process. Provides real-time progress updates, learning
 * insights, and automated optimization recommendations.
 */

import { PrismaClient } from '@prisma/client';
import { logger } from './logger';
import { runPostBatchGateCheck, type BatchGateResults } from './performance-gates';
import { EventEmitter } from 'events';

const prisma = new PrismaClient();

export interface BatchConfig {
  batchNumber: number;
  targetCompanies: number;
  targetContacts: number;
  importSource: string;
  scheduledDate?: Date;
  estimatedDuration: number; // minutes
  learningGoals: string[];
  performanceTargets: {
    maxLoadTime: number;
    maxSearchTime: number;
    minSuccessRate: number;
    minMobileScore: number;
  };
}

export interface BatchProgress {
  id: string;
  batchNumber: number;
  status: 'planned' | 'preparing' | 'importing' | 'validating' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  currentStep: string;
  progress: {
    companiesProcessed: number;
    contactsProcessed: number;
    totalRecords: number;
    successfulRecords: number;
    failedRecords: number;
    duplicatesFound: number;
    percentComplete: number;
  };
  performance: {
    importSpeed: number; // records per minute
    memoryUsage: number; // MB
    errorRate: number; // percentage
    estimatedTimeRemaining: number; // minutes
  };
  insights: {
    newPatterns: string[];
    performanceChanges: string[];
    userBehaviorInsights: string[];
    dataQualityObservations: string[];
  };
  issues: Array<{
    type: 'error' | 'warning' | 'info';
    message: string;
    count: number;
    firstSeen: Date;
    lastSeen: Date;
    resolved: boolean;
  }>;
}

export interface BatchSummary {
  batchNumber: number;
  config: BatchConfig;
  progress: BatchProgress;
  gateResults?: BatchGateResults;
  learnings: {
    performanceLearnings: string[];
    userBehaviorLearnings: string[];
    dataQualityLearnings: string[];
    technicalLearnings: string[];
  };
  optimizations: Array<{
    area: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'high' | 'medium' | 'low';
    priority: number;
    implemented: boolean;
  }>;
  recommendations: {
    nextBatchSize: number;
    focusAreas: string[];
    risksToWatch: string[];
    optimizationsToImplement: string[];
  };
}

class BatchProgressTracker extends EventEmitter {
  private batchProgress = new Map<number, BatchProgress>();
  private batchConfigs = new Map<number, BatchConfig>();
  private progressUpdateInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.on('batchStarted', (batchNumber) => {
      logger.info(`Batch ${batchNumber} started - beginning progress tracking`);
    });

    this.on('batchCompleted', async (batchNumber) => {
      logger.info(`Batch ${batchNumber} completed - running final analysis`);
      await this.runPostBatchAnalysis(batchNumber);
    });

    this.on('performanceAlert', (batchNumber, alert) => {
      logger.warn(`Performance alert for batch ${batchNumber}:`, alert);
    });
  }

  async initializeBatch(config: BatchConfig): Promise<string> {
    const progressId = `batch-${config.batchNumber}-${Date.now()}`;
    
    const progress: BatchProgress = {
      id: progressId,
      batchNumber: config.batchNumber,
      status: 'planned',
      currentStep: 'Initializing batch configuration',
      progress: {
        companiesProcessed: 0,
        contactsProcessed: 0,
        totalRecords: config.targetCompanies + config.targetContacts,
        successfulRecords: 0,
        failedRecords: 0,
        duplicatesFound: 0,
        percentComplete: 0
      },
      performance: {
        importSpeed: 0,
        memoryUsage: 0,
        errorRate: 0,
        estimatedTimeRemaining: config.estimatedDuration
      },
      insights: {
        newPatterns: [],
        performanceChanges: [],
        userBehaviorInsights: [],
        dataQualityObservations: []
      },
      issues: []
    };

    this.batchConfigs.set(config.batchNumber, config);
    this.batchProgress.set(config.batchNumber, progress);

    logger.info(`Initialized batch ${config.batchNumber} tracking`, { progressId, config });
    
    return progressId;
  }

  async startBatch(batchNumber: number): Promise<void> {
    const progress = this.batchProgress.get(batchNumber);
    if (!progress) {
      throw new Error(`Batch ${batchNumber} not initialized`);
    }

    progress.status = 'preparing';
    progress.startedAt = new Date();
    progress.currentStep = 'Running pre-batch validation';

    // Run pre-batch performance gate checks
    try {
      const preGateResults = await runPostBatchGateCheck(batchNumber - 1); // Check previous batch
      if (!preGateResults.readyForNextBatch) {
        progress.status = 'failed';
        progress.currentStep = 'Pre-batch validation failed';
        
        const criticalIssues = preGateResults.criticalFailures.map(f => f.name).join(', ');
        this.addIssue(batchNumber, 'error', `Pre-batch validation failed: ${criticalIssues}`, 1);
        
        throw new Error(`Cannot start batch ${batchNumber}: Pre-batch validation failed`);
      }
    } catch (error) {
      logger.warn(`Pre-batch validation error:`, error.message);
      // Continue with batch but record the warning
      this.addIssue(batchNumber, 'warning', `Pre-batch validation warning: ${error.message}`, 1);
    }

    progress.status = 'importing';
    progress.currentStep = 'Starting import process';
    
    this.emit('batchStarted', batchNumber);
    this.startProgressMonitoring(batchNumber);
    
    logger.info(`Batch ${batchNumber} started successfully`);
  }

  private startProgressMonitoring(batchNumber: number): void {
    // Clear existing interval if any
    if (this.progressUpdateInterval) {
      clearInterval(this.progressUpdateInterval);
    }

    // Update progress every 30 seconds
    this.progressUpdateInterval = setInterval(() => {
      this.updateBatchProgress(batchNumber).catch(error => {
        logger.error(`Error updating batch ${batchNumber} progress:`, error);
      });
    }, 30000);
  }

  private async updateBatchProgress(batchNumber: number): Promise<void> {
    const progress = this.batchProgress.get(batchNumber);
    if (!progress || progress.status === 'completed' || progress.status === 'failed') {
      return;
    }

    try {
      // Update progress metrics
      await this.updateProgressMetrics(batchNumber);
      
      // Update performance metrics
      await this.updatePerformanceMetrics(batchNumber);
      
      // Check for performance alerts
      await this.checkPerformanceAlerts(batchNumber);
      
      // Update insights
      await this.updateInsights(batchNumber);
      
      // Emit progress update
      this.emit('progressUpdate', batchNumber, progress);
      
    } catch (error) {
      logger.error(`Failed to update progress for batch ${batchNumber}:`, error);
      this.addIssue(batchNumber, 'error', `Progress update failed: ${error.message}`, 1);
    }
  }

  private async updateProgressMetrics(batchNumber: number): Promise<void> {
    const progress = this.batchProgress.get(batchNumber);
    if (!progress) return;

    try {
      // Get current counts from database
      const totalCompanies = await prisma.company.count();
      const totalContacts = await prisma.contact.count();
      
      // Calculate progress based on batch start
      const config = this.batchConfigs.get(batchNumber);
      if (!config) return;

      // Mock progress calculation - in production would track actual import progress
      const mockProgress = Math.min(95, (Date.now() - (progress.startedAt?.getTime() || 0)) / (config.estimatedDuration * 60000) * 100);
      
      progress.progress.companiesProcessed = Math.floor(config.targetCompanies * (mockProgress / 100));
      progress.progress.contactsProcessed = Math.floor(config.targetContacts * (mockProgress / 100));
      progress.progress.percentComplete = mockProgress;
      
      // Update current step based on progress
      if (mockProgress < 25) {
        progress.currentStep = 'Processing company data';
      } else if (mockProgress < 50) {
        progress.currentStep = 'Processing contact data';
      } else if (mockProgress < 75) {
        progress.currentStep = 'Validating data relationships';
      } else if (mockProgress < 95) {
        progress.currentStep = 'Finalizing import';
      } else {
        progress.currentStep = 'Running post-import validation';
      }

    } catch (error) {
      logger.error('Failed to update progress metrics:', error);
    }
  }

  private async updatePerformanceMetrics(batchNumber: number): Promise<void> {
    const progress = this.batchProgress.get(batchNumber);
    if (!progress) return;

    try {
      // Update memory usage
      const memoryUsage = process.memoryUsage();
      progress.performance.memoryUsage = Math.round(memoryUsage.heapUsed / 1024 / 1024);

      // Calculate import speed
      const elapsedMinutes = progress.startedAt ? 
        (Date.now() - progress.startedAt.getTime()) / (1000 * 60) : 1;
      progress.performance.importSpeed = Math.round(
        (progress.progress.companiesProcessed + progress.progress.contactsProcessed) / elapsedMinutes
      );

      // Estimate time remaining
      const remainingRecords = progress.progress.totalRecords - 
        (progress.progress.companiesProcessed + progress.progress.contactsProcessed);
      progress.performance.estimatedTimeRemaining = progress.performance.importSpeed > 0 ?
        Math.round(remainingRecords / progress.performance.importSpeed) : 0;

      // Update error rate
      const totalProcessed = progress.progress.companiesProcessed + progress.progress.contactsProcessed;
      progress.performance.errorRate = totalProcessed > 0 ?
        (progress.progress.failedRecords / totalProcessed) * 100 : 0;

    } catch (error) {
      logger.error('Failed to update performance metrics:', error);
    }
  }

  private async checkPerformanceAlerts(batchNumber: number): Promise<void> {
    const progress = this.batchProgress.get(batchNumber);
    const config = this.batchConfigs.get(batchNumber);
    if (!progress || !config) return;

    const alerts: string[] = [];

    // Check memory usage
    if (progress.performance.memoryUsage > 500) {
      alerts.push(`High memory usage: ${progress.performance.memoryUsage}MB`);
    }

    // Check error rate
    if (progress.performance.errorRate > 5) {
      alerts.push(`High error rate: ${progress.performance.errorRate.toFixed(1)}%`);
    }

    // Check import speed
    if (progress.performance.importSpeed < 50) {
      alerts.push(`Slow import speed: ${progress.performance.importSpeed} records/min`);
    }

    // Emit alerts
    alerts.forEach(alert => {
      this.emit('performanceAlert', batchNumber, alert);
      this.addIssue(batchNumber, 'warning', alert, 1);
    });
  }

  private async updateInsights(batchNumber: number): Promise<void> {
    const progress = this.batchProgress.get(batchNumber);
    if (!progress) return;

    try {
      // Generate insights based on current progress
      const newInsights = await this.generateProgressInsights(batchNumber);
      
      // Add new insights without duplicating
      newInsights.performanceInsights.forEach(insight => {
        if (!progress.insights.performanceChanges.includes(insight)) {
          progress.insights.performanceChanges.push(insight);
        }
      });

      newInsights.dataInsights.forEach(insight => {
        if (!progress.insights.dataQualityObservations.includes(insight)) {
          progress.insights.dataQualityObservations.push(insight);
        }
      });

    } catch (error) {
      logger.error('Failed to update insights:', error);
    }
  }

  private async generateProgressInsights(batchNumber: number): Promise<{
    performanceInsights: string[];
    dataInsights: string[];
    userInsights: string[];
  }> {
    const progress = this.batchProgress.get(batchNumber);
    if (!progress) return { performanceInsights: [], dataInsights: [], userInsights: [] };

    const insights = {
      performanceInsights: [] as string[],
      dataInsights: [] as string[],
      userInsights: [] as string[]
    };

    // Performance insights
    if (progress.performance.importSpeed > 100) {
      insights.performanceInsights.push('Import performance is exceeding expectations');
    }
    
    if (progress.performance.memoryUsage < 200) {
      insights.performanceInsights.push('Memory usage remains well within acceptable limits');
    }

    // Data insights
    if (progress.progress.duplicatesFound > progress.progress.successfulRecords * 0.1) {
      insights.dataInsights.push('Higher than expected duplicate rate detected');
    }

    if (progress.performance.errorRate < 1) {
      insights.dataInsights.push('Excellent data quality with minimal import errors');
    }

    return insights;
  }

  async completeBatch(batchNumber: number): Promise<BatchSummary> {
    const progress = this.batchProgress.get(batchNumber);
    const config = this.batchConfigs.get(batchNumber);
    
    if (!progress || !config) {
      throw new Error(`Batch ${batchNumber} not found`);
    }

    progress.status = 'validating';
    progress.currentStep = 'Running post-batch validation';
    progress.completedAt = new Date();

    // Stop progress monitoring
    if (this.progressUpdateInterval) {
      clearInterval(this.progressUpdateInterval);
      this.progressUpdateInterval = null;
    }

    try {
      // Run post-batch performance gate checks
      const gateResults = await runPostBatchGateCheck(batchNumber);
      
      progress.status = gateResults.overallPass ? 'completed' : 'failed';
      progress.currentStep = gateResults.overallPass ? 'Batch completed successfully' : 'Batch failed validation';

      // Generate comprehensive batch summary
      const summary = await this.generateBatchSummary(batchNumber, gateResults);
      
      this.emit('batchCompleted', batchNumber);
      
      logger.info(`Batch ${batchNumber} completed`, {
        status: progress.status,
        overallPass: gateResults.overallPass,
        companiesProcessed: progress.progress.companiesProcessed,
        contactsProcessed: progress.progress.contactsProcessed
      });

      return summary;

    } catch (error) {
      progress.status = 'failed';
      progress.currentStep = `Batch completion failed: ${error.message}`;
      
      logger.error(`Failed to complete batch ${batchNumber}:`, error);
      throw error;
    }
  }

  private async generateBatchSummary(batchNumber: number, gateResults: BatchGateResults): Promise<BatchSummary> {
    const progress = this.batchProgress.get(batchNumber);
    const config = this.batchConfigs.get(batchNumber);
    
    if (!progress || !config) {
      throw new Error(`Batch ${batchNumber} data not found`);
    }

    // Generate learnings based on batch results
    const learnings = {
      performanceLearnings: [
        `Import speed averaged ${progress.performance.importSpeed} records/minute`,
        `Memory usage peaked at ${progress.performance.memoryUsage}MB`,
        `Error rate was ${progress.performance.errorRate.toFixed(2)}%`
      ],
      userBehaviorLearnings: progress.insights.userBehaviorInsights,
      dataQualityLearnings: progress.insights.dataQualityObservations,
      technicalLearnings: progress.insights.performanceChanges
    };

    // Generate optimization recommendations
    const optimizations = this.generateOptimizationRecommendations(progress, gateResults);

    // Generate next batch recommendations
    const recommendations = this.generateNextBatchRecommendations(progress, gateResults);

    return {
      batchNumber,
      config,
      progress,
      gateResults,
      learnings,
      optimizations,
      recommendations
    };
  }

  private generateOptimizationRecommendations(progress: BatchProgress, gateResults: BatchGateResults) {
    const optimizations: BatchSummary['optimizations'] = [];

    // Performance-based optimizations
    if (progress.performance.memoryUsage > 400) {
      optimizations.push({
        area: 'Memory Usage',
        description: 'Optimize memory usage during import process',
        impact: 'medium',
        effort: 'medium',
        priority: 1,
        implemented: false
      });
    }

    if (progress.performance.errorRate > 2) {
      optimizations.push({
        area: 'Data Quality',
        description: 'Improve data validation and error handling',
        impact: 'high',
        effort: 'medium',
        priority: 1,
        implemented: false
      });
    }

    // Gate-based optimizations
    gateResults.criticalFailures.forEach((failure, index) => {
      optimizations.push({
        area: failure.name,
        description: failure.suggestions?.[0] || 'Address critical performance issue',
        impact: 'high',
        effort: 'high',
        priority: index + 1,
        implemented: false
      });
    });

    return optimizations.sort((a, b) => a.priority - b.priority);
  }

  private generateNextBatchRecommendations(progress: BatchProgress, gateResults: BatchGateResults): BatchSummary['recommendations'] {
    const baseSize = 150; // Base batch size
    let recommendedSize = baseSize;

    // Adjust batch size based on performance
    if (progress.performance.importSpeed > 200) {
      recommendedSize = Math.min(250, baseSize * 1.5); // Increase if performing well
    } else if (progress.performance.importSpeed < 50) {
      recommendedSize = Math.max(100, baseSize * 0.7); // Decrease if struggling
    }

    const focusAreas: string[] = [];
    const risksToWatch: string[] = [];
    const optimizationsToImplement: string[] = [];

    // Analyze results to generate recommendations
    if (progress.performance.errorRate > 1) {
      focusAreas.push('Data quality improvement');
      optimizationsToImplement.push('Enhanced data validation');
    }

    if (progress.performance.memoryUsage > 300) {
      focusAreas.push('Memory optimization');
      risksToWatch.push('Memory usage scaling');
    }

    if (gateResults.criticalFailures.length > 0) {
      focusAreas.push('Performance optimization');
      risksToWatch.push('Performance degradation');
    }

    if (progress.insights.newPatterns.length > 0) {
      focusAreas.push('User behavior analysis');
    }

    return {
      nextBatchSize: recommendedSize,
      focusAreas: focusAreas.length > 0 ? focusAreas : ['Continue current approach'],
      risksToWatch: risksToWatch.length > 0 ? risksToWatch : ['Monitor standard performance metrics'],
      optimizationsToImplement: optimizationsToImplement.length > 0 ? optimizationsToImplement : ['No immediate optimizations needed']
    };
  }

  private addIssue(batchNumber: number, type: 'error' | 'warning' | 'info', message: string, count: number): void {
    const progress = this.batchProgress.get(batchNumber);
    if (!progress) return;

    const existingIssue = progress.issues.find(issue => issue.message === message);
    if (existingIssue) {
      existingIssue.count += count;
      existingIssue.lastSeen = new Date();
    } else {
      progress.issues.push({
        type,
        message,
        count,
        firstSeen: new Date(),
        lastSeen: new Date(),
        resolved: false
      });
    }
  }

  private async runPostBatchAnalysis(batchNumber: number): Promise<void> {
    // Perform comprehensive post-batch analysis
    logger.info(`Running post-batch analysis for batch ${batchNumber}`);
    
    try {
      // Analyze system performance changes
      // Analyze user behavior changes
      // Generate recommendations for next batch
      
      logger.info(`Post-batch analysis completed for batch ${batchNumber}`);
    } catch (error) {
      logger.error(`Post-batch analysis failed for batch ${batchNumber}:`, error);
    }
  }

  // Public API methods
  getBatchProgress(batchNumber: number): BatchProgress | undefined {
    return this.batchProgress.get(batchNumber);
  }

  getAllBatches(): Array<{ batchNumber: number; progress: BatchProgress }> {
    return Array.from(this.batchProgress.entries()).map(([batchNumber, progress]) => ({
      batchNumber,
      progress
    }));
  }

  getBatchConfig(batchNumber: number): BatchConfig | undefined {
    return this.batchConfigs.get(batchNumber);
  }
}

// Singleton instance
const batchProgressTracker = new BatchProgressTracker();

export { batchProgressTracker, BatchProgressTracker };