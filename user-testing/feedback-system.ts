#!/usr/bin/env npx tsx

/**
 * STEP 6: User Testing Launch Setup
 * Feedback Collection and Management System
 * 
 * Comprehensive system for collecting, organizing, and managing beta user feedback
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { performance } from 'perf_hooks';

interface FeedbackEntry {
  id: string;
  userId: string;
  userName: string;
  email: string;
  timestamp: string;
  category: 'bug' | 'feature' | 'usability' | 'performance' | 'content' | 'general';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  browserInfo?: string;
  screenshotUrl?: string;
  status: 'new' | 'in-review' | 'in-progress' | 'resolved' | 'closed';
  assignedTo?: string;
  resolution?: string;
  resolutionDate?: string;
  votes: number;
  comments: FeedbackComment[];
  tags: string[];
}

interface FeedbackComment {
  id: string;
  userId: string;
  userName: string;
  timestamp: string;
  comment: string;
  isInternal: boolean;
}

interface BetaUser {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  industry: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'completed';
  engagementScore: number;
  feedbackCount: number;
  lastActivity: string;
}

interface WeeklySurvey {
  id: string;
  userId: string;
  week: number;
  timestamp: string;
  overallSatisfaction: number; // 1-10
  easeOfUse: number; // 1-10
  featureCompleteness: number; // 1-10
  performance: number; // 1-10
  wouldRecommend: number; // 1-10
  mostUsefulFeature: string;
  leastUsefulFeature: string;
  missingFeatures: string;
  biggestPainPoint: string;
  improvementSuggestions: string;
  additionalComments: string;
}

class FeedbackManagementSystem {
  private feedbackStorage: string = 'user-testing/data/feedback.json';
  private usersStorage: string = 'user-testing/data/beta-users.json';
  private surveysStorage: string = 'user-testing/data/weekly-surveys.json';
  private feedback: FeedbackEntry[] = [];
  private users: BetaUser[] = [];
  private surveys: WeeklySurvey[] = [];

  constructor() {
    this.initializeStorage();
  }

  private async initializeStorage(): Promise<void> {
    const dataDir = 'user-testing/data';
    try {
      await fs.mkdir(dataDir, { recursive: true });
      
      // Initialize empty files if they don't exist
      for (const file of [this.feedbackStorage, this.usersStorage, this.surveysStorage]) {
        try {
          await fs.access(file);
        } catch {
          await fs.writeFile(file, '[]', 'utf8');
        }
      }
      
      await this.loadData();
    } catch (error) {
      console.error('Error initializing storage:', error);
    }
  }

  private async loadData(): Promise<void> {
    try {
      const feedbackData = await fs.readFile(this.feedbackStorage, 'utf8');
      this.feedback = JSON.parse(feedbackData);
      
      const usersData = await fs.readFile(this.usersStorage, 'utf8');
      this.users = JSON.parse(usersData);
      
      const surveysData = await fs.readFile(this.surveysStorage, 'utf8');
      this.surveys = JSON.parse(surveysData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  private async saveData(): Promise<void> {
    try {
      await fs.writeFile(this.feedbackStorage, JSON.stringify(this.feedback, null, 2));
      await fs.writeFile(this.usersStorage, JSON.stringify(this.users, null, 2));
      await fs.writeFile(this.surveysStorage, JSON.stringify(this.surveys, null, 2));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  // =============================================================================
  // FEEDBACK COLLECTION METHODS
  // =============================================================================

  async submitFeedback(feedbackData: Partial<FeedbackEntry>): Promise<string> {
    const feedback: FeedbackEntry = {
      id: this.generateId('FB'),
      userId: feedbackData.userId || '',
      userName: feedbackData.userName || '',
      email: feedbackData.email || '',
      timestamp: new Date().toISOString(),
      category: feedbackData.category || 'general',
      priority: feedbackData.priority || 'medium',
      title: feedbackData.title || '',
      description: feedbackData.description || '',
      stepsToReproduce: feedbackData.stepsToReproduce,
      expectedBehavior: feedbackData.expectedBehavior,
      actualBehavior: feedbackData.actualBehavior,
      browserInfo: feedbackData.browserInfo,
      screenshotUrl: feedbackData.screenshotUrl,
      status: 'new',
      votes: 0,
      comments: [],
      tags: feedbackData.tags || []
    };

    this.feedback.push(feedback);
    await this.updateUserEngagement(feedback.userId, 'feedback');
    await this.saveData();

    console.log(`✅ Feedback submitted: ${feedback.id} - ${feedback.title}`);
    return feedback.id;
  }

  async submitWeeklySurvey(surveyData: Partial<WeeklySurvey>): Promise<string> {
    const survey: WeeklySurvey = {
      id: this.generateId('WS'),
      userId: surveyData.userId || '',
      week: surveyData.week || 1,
      timestamp: new Date().toISOString(),
      overallSatisfaction: surveyData.overallSatisfaction || 5,
      easeOfUse: surveyData.easeOfUse || 5,
      featureCompleteness: surveyData.featureCompleteness || 5,
      performance: surveyData.performance || 5,
      wouldRecommend: surveyData.wouldRecommend || 5,
      mostUsefulFeature: surveyData.mostUsefulFeature || '',
      leastUsefulFeature: surveyData.leastUsefulFeature || '',
      missingFeatures: surveyData.missingFeatures || '',
      biggestPainPoint: surveyData.biggestPainPoint || '',
      improvementSuggestions: surveyData.improvementSuggestions || '',
      additionalComments: surveyData.additionalComments || ''
    };

    this.surveys.push(survey);
    await this.updateUserEngagement(survey.userId, 'survey');
    await this.saveData();

    console.log(`✅ Weekly survey submitted: ${survey.id} - Week ${survey.week}`);
    return survey.id;
  }

  // =============================================================================
  // USER MANAGEMENT METHODS
  // =============================================================================

  async addBetaUser(userData: Partial<BetaUser>): Promise<string> {
    const user: BetaUser = {
      id: this.generateId('BU'),
      name: userData.name || '',
      email: userData.email || '',
      company: userData.company || '',
      role: userData.role || '',
      industry: userData.industry || '',
      joinDate: new Date().toISOString(),
      status: 'active',
      engagementScore: 0,
      feedbackCount: 0,
      lastActivity: new Date().toISOString()
    };

    this.users.push(user);
    await this.saveData();

    console.log(`✅ Beta user added: ${user.id} - ${user.name}`);
    return user.id;
  }

  async updateUserEngagement(userId: string, activityType: 'login' | 'feedback' | 'survey' | 'forum' | 'event'): Promise<void> {
    const user = this.users.find(u => u.id === userId);
    if (!user) return;

    user.lastActivity = new Date().toISOString();
    
    // Update engagement score based on activity type
    const scoreIncrements = {
      login: 1,
      feedback: 5,
      survey: 10,
      forum: 3,
      event: 8
    };

    user.engagementScore += scoreIncrements[activityType];
    
    if (activityType === 'feedback') {
      user.feedbackCount++;
    }

    await this.saveData();
  }

  // =============================================================================
  // FEEDBACK ANALYSIS METHODS
  // =============================================================================

  generateFeedbackReport(): string {
    const totalFeedback = this.feedback.length;
    const categoryBreakdown = this.getCategoryBreakdown();
    const priorityBreakdown = this.getPriorityBreakdown();
    const statusBreakdown = this.getStatusBreakdown();
    const avgSurveyScores = this.getAverageSurveyScores();
    const topIssues = this.getTopIssues();
    const userEngagement = this.getUserEngagementStats();

    return `
🔄 BETA USER FEEDBACK REPORT
===========================
📅 Report Date: ${new Date().toLocaleString()}
📊 Total Feedback Entries: ${totalFeedback}
👥 Active Beta Users: ${this.users.filter(u => u.status === 'active').length}
📋 Weekly Surveys Completed: ${this.surveys.length}

📊 FEEDBACK BREAKDOWN:
=====================
${Object.entries(categoryBreakdown).map(([category, count]) => 
  `${category.toUpperCase()}: ${count} (${((count / totalFeedback) * 100).toFixed(1)}%)`
).join('\n')}

🚨 PRIORITY DISTRIBUTION:
========================
${Object.entries(priorityBreakdown).map(([priority, count]) => 
  `${priority.toUpperCase()}: ${count} (${((count / totalFeedback) * 100).toFixed(1)}%)`
).join('\n')}

📈 STATUS TRACKING:
==================
${Object.entries(statusBreakdown).map(([status, count]) => 
  `${status.toUpperCase()}: ${count} (${((count / totalFeedback) * 100).toFixed(1)}%)`
).join('\n')}

⭐ AVERAGE SURVEY SCORES (1-10):
===============================
Overall Satisfaction: ${avgSurveyScores.overallSatisfaction.toFixed(1)}
Ease of Use: ${avgSurveyScores.easeOfUse.toFixed(1)}
Feature Completeness: ${avgSurveyScores.featureCompleteness.toFixed(1)}
Performance: ${avgSurveyScores.performance.toFixed(1)}
Would Recommend: ${avgSurveyScores.wouldRecommend.toFixed(1)}

🔥 TOP ISSUES (By Votes):
========================
${topIssues.slice(0, 5).map((issue, index) => 
  `${index + 1}. ${issue.title} (${issue.votes} votes) - ${issue.priority.toUpperCase()}`
).join('\n')}

👥 USER ENGAGEMENT:
==================
${userEngagement.map(user => 
  `${user.name}: ${user.engagementScore} points, ${user.feedbackCount} feedback entries`
).join('\n')}

💡 KEY INSIGHTS:
===============
• Most common feedback category: ${Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0][0]}
• Critical issues: ${priorityBreakdown.critical || 0}
• Resolved issues: ${statusBreakdown.resolved || 0}
• User satisfaction trend: ${this.getSatisfactionTrend()}

🎯 RECOMMENDED ACTIONS:
======================
${this.generateRecommendations()}

===========================
`;
  }

  private getCategoryBreakdown(): { [key: string]: number } {
    return this.feedback.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }

  private getPriorityBreakdown(): { [key: string]: number } {
    return this.feedback.reduce((acc, item) => {
      acc[item.priority] = (acc[item.priority] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }

  private getStatusBreakdown(): { [key: string]: number } {
    return this.feedback.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
  }

  private getAverageSurveyScores(): { [key: string]: number } {
    if (this.surveys.length === 0) {
      return {
        overallSatisfaction: 0,
        easeOfUse: 0,
        featureCompleteness: 0,
        performance: 0,
        wouldRecommend: 0
      };
    }

    const totals = this.surveys.reduce((acc, survey) => {
      acc.overallSatisfaction += survey.overallSatisfaction;
      acc.easeOfUse += survey.easeOfUse;
      acc.featureCompleteness += survey.featureCompleteness;
      acc.performance += survey.performance;
      acc.wouldRecommend += survey.wouldRecommend;
      return acc;
    }, {
      overallSatisfaction: 0,
      easeOfUse: 0,
      featureCompleteness: 0,
      performance: 0,
      wouldRecommend: 0
    });

    const count = this.surveys.length;
    return {
      overallSatisfaction: totals.overallSatisfaction / count,
      easeOfUse: totals.easeOfUse / count,
      featureCompleteness: totals.featureCompleteness / count,
      performance: totals.performance / count,
      wouldRecommend: totals.wouldRecommend / count
    };
  }

  private getTopIssues(): FeedbackEntry[] {
    return this.feedback
      .filter(item => item.category === 'bug' || item.priority === 'high' || item.priority === 'critical')
      .sort((a, b) => b.votes - a.votes);
  }

  private getUserEngagementStats(): { name: string; engagementScore: number; feedbackCount: number }[] {
    return this.users
      .filter(u => u.status === 'active')
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, 10);
  }

  private getSatisfactionTrend(): string {
    if (this.surveys.length < 2) return 'Insufficient data';
    
    const recentSurveys = this.surveys.slice(-5);
    const avgRecent = recentSurveys.reduce((sum, s) => sum + s.overallSatisfaction, 0) / recentSurveys.length;
    
    if (avgRecent >= 8) return 'Very Positive';
    if (avgRecent >= 6) return 'Positive';
    if (avgRecent >= 4) return 'Neutral';
    return 'Needs Improvement';
  }

  private generateRecommendations(): string {
    const recommendations: string[] = [];
    
    const criticalIssues = this.feedback.filter(f => f.priority === 'critical' && f.status === 'new').length;
    if (criticalIssues > 0) {
      recommendations.push(`• Address ${criticalIssues} critical issues immediately`);
    }

    const avgSatisfaction = this.getAverageSurveyScores().overallSatisfaction;
    if (avgSatisfaction < 6) {
      recommendations.push('• Focus on improving overall user satisfaction');
    }

    const bugCount = this.feedback.filter(f => f.category === 'bug').length;
    if (bugCount > this.feedback.length * 0.4) {
      recommendations.push('• Prioritize bug fixes over new features');
    }

    const inactiveUsers = this.users.filter(u => u.engagementScore < 10).length;
    if (inactiveUsers > 0) {
      recommendations.push(`• Re-engage ${inactiveUsers} inactive users`);
    }

    return recommendations.length > 0 ? recommendations.join('\n') : '• Continue current approach - metrics look good!';
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  private generateId(prefix: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${prefix}${timestamp}${random}`.toUpperCase();
  }

  // =============================================================================
  // DEMO DATA GENERATION
  // =============================================================================

  async generateDemoData(): Promise<void> {
    console.log('🔄 Generating demo beta user feedback data...\n');

    // Add demo beta users
    const demoUsers = [
      { name: 'Sarah Johnson', email: 'sarah.j@techcorp.com', company: 'TechCorp', role: 'BD Manager', industry: 'Technology' },
      { name: 'Michael Chen', email: 'mchen@startup.co', company: 'InnovateCo', role: 'Founder', industry: 'SaaS' },
      { name: 'Emily Rodriguez', email: 'emily.r@consulting.com', company: 'ProConsult', role: 'Senior Consultant', industry: 'Consulting' },
      { name: 'David Kim', email: 'dkim@salesforce.com', company: 'SalesForce Inc', role: 'Sales Director', industry: 'Sales' },
      { name: 'Lisa Thompson', email: 'lisa.t@marketing.com', company: 'MarketPro', role: 'Marketing Manager', industry: 'Marketing' }
    ];

    for (const userData of demoUsers) {
      await this.addBetaUser(userData);
    }

    // Add demo feedback entries
    const demoFeedback = [
      {
        userId: this.users[0].id,
        userName: this.users[0].name,
        email: this.users[0].email,
        category: 'bug' as const,
        priority: 'high' as const,
        title: 'Search results not loading on mobile',
        description: 'When I search for companies on my mobile device, the results page just shows a loading spinner and never loads.',
        stepsToReproduce: '1. Open mobile browser\n2. Go to /orgs/companies\n3. Enter search term\n4. Observe loading state',
        expectedBehavior: 'Search results should load within 3 seconds',
        actualBehavior: 'Infinite loading spinner, no results shown',
        browserInfo: 'Safari on iOS 15.2, iPhone 12'
      },
      {
        userId: this.users[1].id,
        userName: this.users[1].name,
        email: this.users[1].email,
        category: 'feature' as const,
        priority: 'medium' as const,
        title: 'Need bulk export feature for contacts',
        description: 'Would love to be able to export all my saved contacts to CSV for use in my CRM system.',
        tags: ['export', 'contacts', 'integration']
      },
      {
        userId: this.users[2].id,
        userName: this.users[2].name,
        email: this.users[2].email,
        category: 'usability' as const,
        priority: 'medium' as const,
        title: 'Forum navigation is confusing',
        description: 'It\'s hard to find my way back to discussions I was participating in. Need better breadcrumbs or navigation.',
        tags: ['navigation', 'forum', 'ux']
      }
    ];

    for (const feedbackData of demoFeedback) {
      await this.submitFeedback(feedbackData);
    }

    // Add demo weekly surveys
    const demoSurveys = [
      {
        userId: this.users[0].id,
        week: 1,
        overallSatisfaction: 7,
        easeOfUse: 8,
        featureCompleteness: 6,
        performance: 5,
        wouldRecommend: 7,
        mostUsefulFeature: 'Company search and discovery',
        leastUsefulFeature: 'Forum discussions',
        missingFeatures: 'Mobile app, CRM integration',
        biggestPainPoint: 'Mobile experience needs work',
        improvementSuggestions: 'Focus on mobile optimization',
        additionalComments: 'Great concept, execution needs refinement'
      },
      {
        userId: this.users[1].id,
        week: 1,
        overallSatisfaction: 8,
        easeOfUse: 9,
        featureCompleteness: 7,
        performance: 8,
        wouldRecommend: 8,
        mostUsefulFeature: 'Event discovery and networking',
        leastUsefulFeature: 'Advanced search filters',
        missingFeatures: 'Integration with LinkedIn, calendar sync',
        biggestPainPoint: 'Limited integration options',
        improvementSuggestions: 'Add more integration possibilities',
        additionalComments: 'Really enjoying the platform so far!'
      }
    ];

    for (const surveyData of demoSurveys) {
      await this.submitWeeklySurvey(surveyData);
    }

    console.log('✅ Demo data generation completed!');
  }
}

// =============================================================================
// CLI INTERFACE
// =============================================================================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const feedbackSystem = new FeedbackManagementSystem();

  switch (command) {
    case 'demo':
      await feedbackSystem.generateDemoData();
      break;
      
    case 'report':
      console.log(feedbackSystem.generateFeedbackReport());
      break;
      
    case 'add-user':
      if (args.length < 6) {
        console.log('Usage: npm run feedback add-user <name> <email> <company> <role> <industry>');
        process.exit(1);
      }
      const userId = await feedbackSystem.addBetaUser({
        name: args[1],
        email: args[2],
        company: args[3],
        role: args[4],
        industry: args[5]
      });
      console.log(`User added with ID: ${userId}`);
      break;
      
    case 'submit-feedback':
      console.log('Interactive feedback submission would be implemented here');
      break;
      
    default:
      console.log(`
🔄 DealMecca Feedback Management System
======================================

Available commands:
  demo          - Generate demo data for testing
  report        - Generate feedback analysis report
  add-user      - Add a new beta user
  submit-feedback - Submit new feedback (interactive)

Usage:
  npx tsx user-testing/feedback-system.ts <command> [args]
      `);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { FeedbackManagementSystem };
export type { FeedbackEntry, BetaUser, WeeklySurvey }; 