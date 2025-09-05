import Anthropic from '@anthropic-ai/sdk';

// Initialize the Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_CODE_API_KEY,
});

export interface CodeGenerationRequest {
  prompt: string;
  language?: string;
  framework?: string;
  complexity?: 'simple' | 'intermediate' | 'advanced';
  type?: 'component' | 'function' | 'api' | 'schema' | 'utility' | 'test';
  context?: string;
}

export interface CodeGenerationResponse {
  code: string;
  explanation: string;
  language: string;
  suggestions?: string[];
  dependencies?: string[];
  tests?: string;
}

export interface CodeAnalysisRequest {
  code: string;
  language?: string;
  analysisType?: 'review' | 'optimize' | 'security' | 'documentation';
}

export interface CodeAnalysisResponse {
  analysis: string;
  suggestions: string[];
  quality_score?: number;
  security_issues?: string[];
  optimization_tips?: string[];
  documentation?: string;
}

export class ClaudeCodeSDK {
  private client: Anthropic;

  constructor() {
    this.client = anthropic;
  }

  /**
   * Generate code based on natural language requirements
   */
  async generateCode(request: CodeGenerationRequest): Promise<CodeGenerationResponse> {
    const systemPrompt = this.buildSystemPrompt(request);
    const userPrompt = this.buildUserPrompt(request);

    try {
      const message = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        temperature: 0.1,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
      return this.parseCodeGenerationResponse(responseText, request);
    } catch (error) {
      console.error('Claude Code Generation Error:', error);
      throw new Error('Failed to generate code: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Analyze existing code for quality, security, and optimization opportunities
   */
  async analyzeCode(request: CodeAnalysisRequest): Promise<CodeAnalysisResponse> {
    const systemPrompt = this.buildAnalysisSystemPrompt(request);
    const userPrompt = `Analyze this ${request.language || 'code'}:\n\n\`\`\`${request.language || ''}\n${request.code}\n\`\`\``;

    try {
      const message = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 3000,
        temperature: 0.1,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
      return this.parseCodeAnalysisResponse(responseText);
    } catch (error) {
      console.error('Claude Code Analysis Error:', error);
      throw new Error('Failed to analyze code: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Generate smart suggestions for forum posts about coding/development
   */
  async generateForumPostSuggestions(title: string, content: string) {
    const systemPrompt = `You are an AI assistant specialized in analyzing development-focused forum posts. 
    Analyze the given title and content to extract relevant information for a media/advertising tech forum.
    
    Return your response as JSON with the following structure:
    {
      "tags": ["array", "of", "relevant", "tags"],
      "technologies": ["detected", "technologies"],
      "frameworks": ["detected", "frameworks"],
      "complexity": "simple|intermediate|advanced",
      "projectType": "frontend|backend|fullstack|mobile|devops|data|ai",
      "urgency": "LOW|MEDIUM|HIGH|URGENT",
      "codeRelated": true|false,
      "suggestedCategories": ["relevant", "forum", "categories"],
      "keyTopics": ["main", "discussion", "topics"]
    }`;

    const userPrompt = `Title: ${title}\n\nContent: ${content}`;

    try {
      const message = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        temperature: 0.1,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
      
      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        // Fallback if JSON parsing fails
        return this.extractSuggestionsFromText(responseText, title, content);
      }
    } catch (error) {
      console.error('Claude Forum Suggestions Error:', error);
      // Return fallback suggestions
      return {
        tags: [],
        technologies: [],
        frameworks: [],
        complexity: 'intermediate',
        projectType: 'fullstack',
        urgency: 'MEDIUM',
        codeRelated: false,
        suggestedCategories: [],
        keyTopics: []
      };
    }
  }

  private buildSystemPrompt(request: CodeGenerationRequest): string {
    const basePrompt = `You are an expert software developer and code generation assistant. 
    Generate clean, well-documented, production-ready code based on user requirements.`;

    const specificInstructions = {
      component: 'Focus on creating reusable, properly typed React/Vue/Angular components with props interfaces and proper styling.',
      function: 'Create pure, testable functions with proper error handling and TypeScript types.',
      api: 'Generate RESTful API endpoints with proper validation, error handling, and documentation.',
      schema: 'Create database schemas with proper relationships, constraints, and indexing.',
      utility: 'Build utility functions that are performant, well-tested, and reusable.',
      test: 'Generate comprehensive unit tests with good coverage and edge case handling.'
    };

    const complexityGuide = {
      simple: 'Keep the solution minimal and straightforward.',
      intermediate: 'Include proper error handling and some optimization.',
      advanced: 'Include comprehensive features, optimization, and advanced patterns.'
    };

    return `${basePrompt}

Type-specific guidance: ${specificInstructions[request.type || 'function']}
Complexity level: ${complexityGuide[request.complexity || 'intermediate']}
${request.language ? `Primary language: ${request.language}` : ''}
${request.framework ? `Framework: ${request.framework}` : ''}

Always include:
1. Clean, readable code with comments
2. Proper error handling
3. TypeScript types when applicable
4. Brief explanation of the solution
5. Any necessary dependencies
6. Basic usage example

Format your response as JSON with this structure:
{
  "code": "the generated code",
  "explanation": "explanation of the solution",
  "language": "detected or specified language",
  "dependencies": ["array of required packages"],
  "usage": "example of how to use the code",
  "tests": "optional test code"
}`;
  }

  private buildUserPrompt(request: CodeGenerationRequest): string {
    let prompt = `Generate ${request.type || 'code'} for: ${request.prompt}`;
    
    if (request.context) {
      prompt += `\n\nContext: ${request.context}`;
    }
    
    if (request.language) {
      prompt += `\n\nLanguage: ${request.language}`;
    }
    
    if (request.framework) {
      prompt += `\n\nFramework: ${request.framework}`;
    }

    return prompt;
  }

  private buildAnalysisSystemPrompt(request: CodeAnalysisRequest): string {
    const analysisTypes = {
      review: 'Perform a comprehensive code review focusing on best practices, maintainability, and code quality.',
      optimize: 'Focus on performance optimization, efficiency improvements, and resource usage.',
      security: 'Analyze for security vulnerabilities, potential exploits, and security best practices.',
      documentation: 'Generate comprehensive documentation including API docs, comments, and usage examples.'
    };

    return `You are an expert code reviewer and software architect. 
    ${analysisTypes[request.analysisType || 'review']}
    
    Provide actionable insights and specific recommendations.
    
    Format your response as JSON:
    {
      "analysis": "comprehensive analysis",
      "suggestions": ["actionable suggestions array"],
      "quality_score": 85,
      "security_issues": ["security concerns if any"],
      "optimization_tips": ["performance improvements"],
      "documentation": "generated documentation if requested"
    }`;
  }

  private parseCodeGenerationResponse(response: string, request: CodeGenerationRequest): CodeGenerationResponse {
    try {
      const parsed = JSON.parse(response);
      return {
        code: parsed.code || '',
        explanation: parsed.explanation || '',
        language: parsed.language || request.language || 'javascript',
        suggestions: parsed.suggestions || [],
        dependencies: parsed.dependencies || [],
        tests: parsed.tests || parsed.usage || ''
      };
    } catch (error) {
      // Fallback parsing if JSON fails
      const codeMatch = response.match(/```[\w]*\n([\s\S]*?)\n```/);
      const code = codeMatch ? codeMatch[1] : response;
      
      return {
        code: code.trim(),
        explanation: 'Generated code based on your requirements.',
        language: request.language || 'javascript',
        suggestions: [],
        dependencies: [],
        tests: ''
      };
    }
  }

  private parseCodeAnalysisResponse(response: string): CodeAnalysisResponse {
    try {
      const parsed = JSON.parse(response);
      return {
        analysis: parsed.analysis || response,
        suggestions: parsed.suggestions || [],
        quality_score: parsed.quality_score || undefined,
        security_issues: parsed.security_issues || [],
        optimization_tips: parsed.optimization_tips || [],
        documentation: parsed.documentation || undefined
      };
    } catch (error) {
      return {
        analysis: response,
        suggestions: [],
        quality_score: undefined,
        security_issues: [],
        optimization_tips: [],
        documentation: undefined
      };
    }
  }

  private extractSuggestionsFromText(text: string, title: string, content: string) {
    // Simple keyword-based fallback extraction
    const combinedText = `${title} ${content}`.toLowerCase();
    
    const technologies = ['react', 'vue', 'angular', 'node', 'python', 'javascript', 'typescript', 'next.js', 'express', 'django']
      .filter(tech => combinedText.includes(tech));
    
    const frameworks = ['nextjs', 'react', 'vue', 'angular', 'express', 'django', 'fastapi', 'rails']
      .filter(fw => combinedText.includes(fw.replace('.', '')));

    const isUrgent = ['urgent', 'asap', 'deadline', 'rush'].some(word => combinedText.includes(word));
    const urgency = isUrgent ? 'URGENT' : 'MEDIUM';

    return {
      tags: technologies.concat(frameworks),
      technologies,
      frameworks,
      complexity: 'intermediate',
      projectType: 'fullstack',
      urgency,
      codeRelated: technologies.length > 0 || frameworks.length > 0,
      suggestedCategories: ['development', 'technical'],
      keyTopics: []
    };
  }
}

// Export singleton instance
export const claudeCodeSDK = new ClaudeCodeSDK();

// Export utility functions
export const generateCode = (request: CodeGenerationRequest) => claudeCodeSDK.generateCode(request);
export const analyzeCode = (request: CodeAnalysisRequest) => claudeCodeSDK.analyzeCode(request);
export const generateForumSuggestions = (title: string, content: string) => claudeCodeSDK.generateForumPostSuggestions(title, content);