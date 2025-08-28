// app/lib/claude-code-config.ts
import Anthropic from '@anthropic-ai/sdk';

// Tool permissions configuration for the vacation rental platform
const ALLOWED_TOOLS = [
  // File Operations
  'file_read',
  'file_write', 
  'file_search',
  'directory_list',
  
  // Database Operations  
  'database_query',
  'database_write',
  'prisma_operations',
  
  // Search & Analysis
  'text_search',
  'code_search', 
  'grep_search',
  
  // Code Generation
  'code_generation',
  'text_generation',
  'json_generation',
  
  // Web & API
  'web_search',
  'api_calls',
  'webhook_handling'
];

const SECURITY_CONFIG = {
  // File system access
  allowedPaths: [
    './app',
    './components', 
    './lib',
    './prisma',
    './scripts'
  ],
  
  // Database access
  databaseAccess: true,
  
  // Network access for AI operations
  networkAccess: true,
  
  // API integrations
  allowExternalAPIs: ['stripe.com', 'maps.googleapis.com'],
  
  // Maximum file size for operations (in MB)
  maxFileSize: 10,
  
  // Rate limiting
  rateLimits: {
    requestsPerMinute: 60,
    tokensPerMinute: 100000
  }
};

// Initialize enhanced Anthropic client with our configuration structure
export const claudeCodeClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Specialized client for trip planning (same instance for now, but structured for future enhancement)
export const tripPlanningClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Property management client (same instance for now, but structured for future enhancement)
export const propertyManagementClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Agent response interface
export interface ClaudeCodeAgentResponse {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    tokensUsed: number;
    processingTime: number;
    toolsUsed: string[];
    cacheHit?: boolean;
  };
}

// Utility function to handle Claude Code SDK responses
export function handleClaudeCodeResponse(response: any): ClaudeCodeAgentResponse {
  try {
    return {
      success: true,
      data: response.data,
      metadata: {
        tokensUsed: response.usage?.total_tokens || 0,
        processingTime: response.processing_time || 0,
        toolsUsed: response.tools_used || [],
        cacheHit: response.cache_hit
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to process Claude Code response: ${error}`,
      metadata: {
        tokensUsed: 0,
        processingTime: 0,
        toolsUsed: []
      }
    };
  }
}

// Configuration validation
export function validateClaudeCodeConfig(): boolean {
  const requiredEnvVars = ['ANTHROPIC_API_KEY'];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`Missing required environment variable: ${envVar}`);
      return false;
    }
  }
  
  return true;
}

// Export configuration for testing and debugging
export const config = {
  allowedTools: ALLOWED_TOOLS,
  security: SECURITY_CONFIG,
  isConfigured: validateClaudeCodeConfig()
};