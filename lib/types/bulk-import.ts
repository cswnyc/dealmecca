// 🚀 DealMecca Bulk Import Type Definitions
// Comprehensive types for scaling from 17 to 5000+ companies

// =============================================================================
// CORE DATA INTERFACES
// =============================================================================

export interface BulkImportContact {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  title: string;
  department?: string;
  linkedinUrl?: string;
  companyName: string;
  verified?: boolean;
  // Media-specific fields
  seniority?: 'C_LEVEL' | 'VP' | 'DIRECTOR' | 'MANAGER' | 'SPECIALIST' | 'COORDINATOR';
  specializations?: string[]; // e.g., ['Programmatic', 'Social Media', 'Search']
  budgetAuthority?: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  decisionMaking?: boolean;
  territories?: string[]; // Geographic areas of responsibility
}

export interface BulkImportCompany {
  name: string;
  domain?: string;
  industry?: string;
  employeeCount?: number;
  revenue?: string;
  headquarters?: string;
  description?: string;
  website?: string;
  type?: 'ADVERTISER' | 'AGENCY' | 'TECH_VENDOR' | 'MEDIA_HOLDING_COMPANY';
  // Agency-specific fields
  agencyType?: 'FULL_SERVICE' | 'MEDIA_AGENCY' | 'CREATIVE_AGENCY' | 'DIGITAL_AGENCY' | 'PR_AGENCY';
  clientFocus?: 'ENTERPRISE' | 'MID_MARKET' | 'SMB' | 'STARTUP';
  mediaSpend?: 'UNDER_1M' | '1M_TO_10M' | '10M_TO_100M' | 'OVER_100M';
  verified?: boolean;
}

// =============================================================================
// IMPORT PROCESS INTERFACES
// =============================================================================

export interface ImportProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  errors: ImportError[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  estimatedTimeRemaining?: number; // seconds
  currentStep?: 'parsing' | 'validating' | 'importing' | 'finalizing';
}

export interface ImportError {
  row: number;
  field: string;
  value: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  suggestion?: string; // Auto-correction suggestion
}

export interface ParsedData {
  companies: BulkImportCompany[];
  contacts: BulkImportContact[];
  errors: ImportError[];
  preview: any[];
  metadata: {
    totalRows: number;
    validRows: number;
    duplicates: number;
    fileSize: number;
    fileName: string;
    parseTime: number;
  };
}

// =============================================================================
// FILE HANDLING INTERFACES
// =============================================================================

export interface FileUploadConfig {
  maxFileSize: number; // bytes
  allowedFormats: ('csv' | 'xlsx' | 'json')[];
  maxRows: number;
  requiredColumns: string[];
  optionalColumns: string[];
}

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fileInfo: {
    name: string;
    size: number;
    type: string;
    rows?: number;
    columns?: string[];
  };
}

// =============================================================================
// VALIDATION INTERFACES
// =============================================================================

export interface ValidationRule {
  field: string;
  type: 'required' | 'email' | 'phone' | 'url' | 'enum' | 'length' | 'pattern';
  message: string;
  params?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
}

export interface ValidationResult {
  isValid: boolean;
  field: string;
  value: any;
  errors: string[];
  warnings: string[];
  suggestion?: string;
}

// =============================================================================
// IMPORT CONFIGURATION
// =============================================================================

export interface ImportOptions {
  skipDuplicates: boolean;
  updateExisting: boolean;
  validateEmails: boolean;
  autoCorrect: boolean;
  batchSize: number;
  createMissingCompanies: boolean;
  assignDefaultValues: boolean;
  notifyOnCompletion: boolean;
}

export interface ColumnMapping {
  source: string; // Column name in uploaded file
  target: keyof (BulkImportContact | BulkImportCompany); // Target field
  required: boolean;
  transform?: 'uppercase' | 'lowercase' | 'trim' | 'phone_format' | 'email_normalize';
  defaultValue?: any;
}

// =============================================================================
// TARGET CONTACT ROLES (Media Seller Focus)
// =============================================================================

export const TARGET_CONTACT_ROLES = [
  'CMO (Chief Marketing Officer)',
  'Media Director',
  'Brand Manager', 
  'Programmatic Trader',
  'Media Associate',
  'Group Agency Director',
  'VP of Media',
  'Digital Marketing Manager',
  'Performance Marketing Manager',
  'Media Planner',
  'Account Director',
  'Business Development Manager'
] as const;

export type TargetContactRole = typeof TARGET_CONTACT_ROLES[number];

// =============================================================================
// IMPORT RESULTS & REPORTING
// =============================================================================

export interface ImportSummary {
  importId: string;
  status: 'completed' | 'failed' | 'partial';
  totalRecords: number;
  successfulImports: {
    companies: number;
    contacts: number;
  };
  failedImports: {
    companies: number;
    contacts: number;
  };
  duplicatesSkipped: {
    companies: number;
    contacts: number;
  };
  executionTime: number; // milliseconds
  errors: ImportError[];
  warnings: ImportError[];
  createdAt: Date;
  completedAt?: Date;
}

export interface ImportJob {
  id: string;
  userId: string;
  fileName: string;
  fileSize: number;
  status: ImportProgress['status'];
  progress: ImportProgress;
  options: ImportOptions;
  mapping: ColumnMapping[];
  summary?: ImportSummary;
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// UI STATE INTERFACES
// =============================================================================

export interface BulkImportState {
  currentStep: 'upload' | 'preview' | 'mapping' | 'options' | 'import' | 'results';
  uploadedFile?: File;
  parsedData?: ParsedData;
  columnMapping: ColumnMapping[];
  importOptions: ImportOptions;
  validationErrors: ImportError[];
  importJob?: ImportJob;
  isLoading: boolean;
  error?: string;
}

// =============================================================================
// API RESPONSE INTERFACES  
// =============================================================================

export interface UploadResponse {
  success: boolean;
  fileId: string;
  parsedData: ParsedData;
  validation: FileValidationResult;
  message?: string;
}

export interface ValidateResponse {
  success: boolean;
  errors: ImportError[];
  warnings: ImportError[];
  summary: {
    totalRows: number;
    validRows: number;
    errorRows: number;
  };
}

export interface ImportResponse {
  success: boolean;
  jobId: string;
  message: string;
  estimatedTime?: number;
}

export interface ImportStatusResponse {
  success: boolean;
  job: ImportJob;
  progress: ImportProgress;
}

// =============================================================================
// DEFAULT CONFIGURATIONS
// =============================================================================

export const DEFAULT_IMPORT_OPTIONS: ImportOptions = {
  skipDuplicates: true,
  updateExisting: false,
  validateEmails: true,
  autoCorrect: true,
  batchSize: 100,
  createMissingCompanies: true,
  assignDefaultValues: true,
  notifyOnCompletion: true,
};

export const DEFAULT_FILE_CONFIG: FileUploadConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFormats: ['csv', 'xlsx'],
  maxRows: 10000,
  requiredColumns: ['firstName', 'lastName', 'title', 'companyName'],
  optionalColumns: ['email', 'phone', 'linkedinUrl', 'department'],
};

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type ImportStep = BulkImportState['currentStep'];
export type ImportStatus = ImportProgress['status'];
export type ErrorSeverity = ImportError['severity'];
export type ValidationRuleType = ValidationRule['type'];

// Export commonly used type unions
export type BulkImportRecord = BulkImportContact | BulkImportCompany;
export type ImportDataType = 'contact' | 'company' | 'mixed';
