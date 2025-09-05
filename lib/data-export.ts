import { PrismaClient } from '@prisma/client';
import { logger } from './logger';
import { auditLogger } from './audit-logger';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

export type ExportFormat = 'csv' | 'excel' | 'json';
export type ExportType = 'contacts' | 'companies' | 'searches' | 'analytics' | 'users';

export interface ExportOptions {
  format: ExportFormat;
  type: ExportType;
  filters?: Record<string, any>;
  fields?: string[];
  includeMetadata?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  userId?: string;
  maxRecords?: number;
}

export interface ExportResult {
  filename: string;
  mimeType: string;
  data: Buffer;
  recordCount: number;
  exportedAt: Date;
  exportedBy?: string;
}

/**
 * Comprehensive data export system supporting CSV, Excel, and JSON formats
 */
export class DataExporter {
  private static instance: DataExporter;

  static getInstance(): DataExporter {
    if (!DataExporter.instance) {
      DataExporter.instance = new DataExporter();
    }
    return DataExporter.instance;
  }

  /**
   * Main export function
   */
  async export(options: ExportOptions, userId?: string): Promise<ExportResult> {
    try {
      // Validate options
      this.validateOptions(options);

      // Get data based on type
      const data = await this.getData(options, userId);
      
      // Apply filters if specified
      const filteredData = this.applyFilters(data, options.filters);
      
      // Limit records if specified
      const limitedData = options.maxRecords 
        ? filteredData.slice(0, options.maxRecords) 
        : filteredData;

      // Select fields if specified
      const selectedData = options.fields 
        ? this.selectFields(limitedData, options.fields) 
        : limitedData;

      // Add metadata if requested
      const finalData = options.includeMetadata 
        ? this.addMetadata(selectedData, options) 
        : selectedData;

      // Generate export based on format
      const exportResult = await this.generateExport(finalData, options);

      // Log export activity
      await this.logExportActivity(options, exportResult, userId);

      return exportResult;

    } catch (error) {
      logger.error('dataExport', 'Export failed', { error, options, userId });
      throw error;
    }
  }

  /**
   * Get contact exports for bulk operations
   */
  async exportContacts(filters: any = {}, options: Partial<ExportOptions> = {}, userId?: string): Promise<ExportResult> {
    const exportOptions: ExportOptions = {
      type: 'contacts',
      format: options.format || 'csv',
      filters,
      fields: options.fields || [
        'id', 'firstName', 'lastName', 'email', 'phone', 'title', 'company',
        'linkedinUrl', 'industry', 'location', 'createdAt'
      ],
      includeMetadata: options.includeMetadata || true,
      maxRecords: options.maxRecords || 10000,
      ...options
    };

    return this.export(exportOptions, userId);
  }

  /**
   * Get company exports
   */
  async exportCompanies(filters: any = {}, options: Partial<ExportOptions> = {}, userId?: string): Promise<ExportResult> {
    const exportOptions: ExportOptions = {
      type: 'companies',
      format: options.format || 'csv',
      filters,
      fields: options.fields || [
        'id', 'name', 'domain', 'industry', 'size', 'location', 'description',
        'website', 'founded', 'revenue', 'employeeCount', 'createdAt'
      ],
      includeMetadata: options.includeMetadata || true,
      maxRecords: options.maxRecords || 5000,
      ...options
    };

    return this.export(exportOptions, userId);
  }

  /**
   * Export search history and analytics
   */
  async exportSearchAnalytics(userId: string, options: Partial<ExportOptions> = {}): Promise<ExportResult> {
    const exportOptions: ExportOptions = {
      type: 'searches',
      format: options.format || 'csv',
      filters: { userId },
      fields: options.fields || [
        'searchId', 'query', 'filters', 'totalResults', 'returnedResults',
        'loadTime', 'contactsViewed', 'emailsRevealed', 'exported', 'saved', 'timestamp'
      ],
      includeMetadata: options.includeMetadata || true,
      userId,
      ...options
    };

    return this.export(exportOptions, userId);
  }

  /**
   * Export user analytics data
   */
  async exportUserAnalytics(targetUserId: string, options: Partial<ExportOptions> = {}, requestingUserId?: string): Promise<ExportResult> {
    const exportOptions: ExportOptions = {
      type: 'analytics',
      format: options.format || 'json',
      filters: { userId: targetUserId },
      includeMetadata: options.includeMetadata || true,
      userId: requestingUserId,
      ...options
    };

    return this.export(exportOptions, requestingUserId);
  }

  /**
   * Validate export options
   */
  private validateOptions(options: ExportOptions): void {
    if (!options.type || !options.format) {
      throw new Error('Export type and format are required');
    }

    if (!['csv', 'excel', 'json'].includes(options.format)) {
      throw new Error('Invalid export format. Supported: csv, excel, json');
    }

    if (!['contacts', 'companies', 'searches', 'analytics', 'users'].includes(options.type)) {
      throw new Error('Invalid export type');
    }

    if (options.maxRecords && options.maxRecords > 50000) {
      throw new Error('Maximum 50,000 records per export');
    }
  }

  /**
   * Get data based on export type
   */
  private async getData(options: ExportOptions, userId?: string): Promise<any[]> {
    switch (options.type) {
      case 'contacts':
        return this.getContactData(options, userId);
      case 'companies':
        return this.getCompanyData(options, userId);
      case 'searches':
        return this.getSearchData(options, userId);
      case 'analytics':
        return this.getAnalyticsData(options, userId);
      case 'users':
        return this.getUserData(options, userId);
      default:
        throw new Error(`Unsupported export type: ${options.type}`);
    }
  }

  /**
   * Get contact data for export
   */
  private async getContactData(options: ExportOptions, userId?: string): Promise<any[]> {
    const where: any = {};
    
    // Apply user-specific filters if not admin
    if (userId && !this.isAdminUser(userId)) {
      where.OR = [
        { isPublic: true },
        { createdBy: userId },
        { viewedBy: { some: { userId } } }
      ];
    }

    // Apply date range filter
    if (options.dateRange) {
      where.createdAt = {
        gte: options.dateRange.start,
        lte: options.dateRange.end
      };
    }

    return prisma.contact.findMany({
      where,
      include: {
        company: {
          select: { name: true, industry: true, website: true }
        },
        _count: {
          select: { interactions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get company data for export
   */
  private async getCompanyData(options: ExportOptions, userId?: string): Promise<any[]> {
    const where: any = {};
    
    if (options.dateRange) {
      where.createdAt = {
        gte: options.dateRange.start,
        lte: options.dateRange.end
      };
    }

    return prisma.company.findMany({
      where,
      include: {
        _count: {
          select: { 
            contacts: true,
            searches: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Get search analytics data
   */
  private async getSearchData(options: ExportOptions, userId?: string): Promise<any[]> {
    const where: any = {};
    
    if (userId) {
      where.userId = userId;
    }

    if (options.dateRange) {
      where.timestamp = {
        gte: options.dateRange.start,
        lte: options.dateRange.end
      };
    }

    return prisma.searchAnalytics.findMany({
      where,
      orderBy: { timestamp: 'desc' }
    });
  }

  /**
   * Get user analytics data
   */
  private async getAnalyticsData(options: ExportOptions, userId?: string): Promise<any[]> {
    const where: any = {};
    
    if (options.filters?.userId) {
      where.userId = options.filters.userId;
    }

    if (options.dateRange) {
      where.timestamp = {
        gte: options.dateRange.start,
        lte: options.dateRange.end
      };
    }

    return prisma.analyticsEvent.findMany({
      where,
      orderBy: { timestamp: 'desc' }
    });
  }

  /**
   * Get user data for admin exports
   */
  private async getUserData(options: ExportOptions, requestingUserId?: string): Promise<any[]> {
    // Only admins can export user data
    if (!requestingUserId || !this.isAdminUser(requestingUserId)) {
      throw new Error('Admin access required for user data export');
    }

    const where: any = {};
    
    if (options.dateRange) {
      where.createdAt = {
        gte: options.dateRange.start,
        lte: options.dateRange.end
      };
    }

    return prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            searches: true,
            exports: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Apply filters to data
   */
  private applyFilters(data: any[], filters?: Record<string, any>): any[] {
    if (!filters || Object.keys(filters).length === 0) {
      return data;
    }

    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (key === 'userId') return true; // Already applied in query
        
        // Handle different filter types
        if (typeof value === 'string' && value.includes(',')) {
          // Multiple values (OR condition)
          const values = value.split(',').map((v: string) => v.trim());
          return values.includes(item[key]);
        }
        
        if (typeof value === 'object' && value !== null) {
          // Range or complex filters
          if (value.min !== undefined && value.max !== undefined) {
            return item[key] >= value.min && item[key] <= value.max;
          }
          if (value.contains !== undefined) {
            return item[key]?.toLowerCase().includes(value.contains.toLowerCase());
          }
        }
        
        // Direct match
        return item[key] === value;
      });
    });
  }

  /**
   * Select specific fields from data
   */
  private selectFields(data: any[], fields: string[]): any[] {
    return data.map(item => {
      const selected: any = {};
      fields.forEach(field => {
        if (field.includes('.')) {
          // Handle nested fields like 'company.name'
          const parts = field.split('.');
          let value = item;
          for (const part of parts) {
            value = value?.[part];
          }
          selected[field] = value;
        } else {
          selected[field] = item[field];
        }
      });
      return selected;
    });
  }

  /**
   * Add metadata to export
   */
  private addMetadata(data: any[], options: ExportOptions): any {
    return {
      metadata: {
        exportType: options.type,
        exportFormat: options.format,
        recordCount: data.length,
        exportedAt: new Date().toISOString(),
        filters: options.filters,
        dateRange: options.dateRange
      },
      data
    };
  }

  /**
   * Generate export file based on format
   */
  private async generateExport(data: any, options: ExportOptions): Promise<ExportResult> {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${options.type}_export_${timestamp}`;

    switch (options.format) {
      case 'csv':
        return this.generateCSV(data, filename, options);
      case 'excel':
        return this.generateExcel(data, filename, options);
      case 'json':
        return this.generateJSON(data, filename, options);
      default:
        throw new Error(`Unsupported format: ${options.format}`);
    }
  }

  /**
   * Generate CSV export
   */
  private generateCSV(data: any, filename: string, options: ExportOptions): ExportResult {
    let csvData = data;
    let recordCount = 0;

    if (options.includeMetadata && data.metadata) {
      csvData = data.data;
      recordCount = data.metadata.recordCount;
    } else {
      recordCount = Array.isArray(data) ? data.length : 0;
    }

    if (!Array.isArray(csvData) || csvData.length === 0) {
      throw new Error('No data available for export');
    }

    // Get headers from first row
    const headers = Object.keys(csvData[0]);
    
    // Create CSV content
    const csvRows = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return JSON.stringify(value);
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value.toString();
        }).join(',')
      )
    ];

    const csvContent = csvRows.join('\n');
    const buffer = Buffer.from(csvContent, 'utf-8');

    return {
      filename: `${filename}.csv`,
      mimeType: 'text/csv',
      data: buffer,
      recordCount,
      exportedAt: new Date()
    };
  }

  /**
   * Generate Excel export
   */
  private generateExcel(data: any, filename: string, options: ExportOptions): ExportResult {
    let excelData = data;
    let recordCount = 0;

    if (options.includeMetadata && data.metadata) {
      excelData = data.data;
      recordCount = data.metadata.recordCount;
    } else {
      recordCount = Array.isArray(data) ? data.length : 0;
    }

    if (!Array.isArray(excelData) || excelData.length === 0) {
      throw new Error('No data available for export');
    }

    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    // Add metadata sheet if included
    if (options.includeMetadata && data.metadata) {
      const metadataWS = XLSX.utils.json_to_sheet([data.metadata]);
      XLSX.utils.book_append_sheet(workbook, metadataWS, 'Metadata');
    }

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return {
      filename: `${filename}.xlsx`,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      data: buffer,
      recordCount,
      exportedAt: new Date()
    };
  }

  /**
   * Generate JSON export
   */
  private generateJSON(data: any, filename: string, options: ExportOptions): ExportResult {
    const recordCount = options.includeMetadata && data.metadata 
      ? data.metadata.recordCount 
      : Array.isArray(data) ? data.length : 1;

    const jsonContent = JSON.stringify(data, null, 2);
    const buffer = Buffer.from(jsonContent, 'utf-8');

    return {
      filename: `${filename}.json`,
      mimeType: 'application/json',
      data: buffer,
      recordCount,
      exportedAt: new Date()
    };
  }

  /**
   * Log export activity
   */
  private async logExportActivity(options: ExportOptions, result: ExportResult, userId?: string): Promise<void> {
    try {
      // Log to audit system
      if (userId) {
        await auditLogger.logEvent({
          action: 'data_exported',
          userId,
          details: {
            exportType: options.type,
            exportFormat: options.format,
            recordCount: result.recordCount,
            filename: result.filename,
            filters: options.filters,
            fieldsCount: options.fields?.length
          }
        });
      }

      // Log to application logger
      logger.info('dataExport', 'Export completed', {
        userId,
        type: options.type,
        format: options.format,
        recordCount: result.recordCount,
        filename: result.filename
      });

    } catch (error) {
      logger.error('dataExport', 'Failed to log export activity', { error, userId });
    }
  }

  /**
   * Check if user is admin (simplified check)
   */
  private async isAdminUser(userId: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });
      return user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const dataExporter = DataExporter.getInstance();

// Utility functions for common export scenarios
export const exportContacts = (filters: any, options: Partial<ExportOptions> = {}, userId?: string) =>
  dataExporter.exportContacts(filters, options, userId);

export const exportCompanies = (filters: any, options: Partial<ExportOptions> = {}, userId?: string) =>
  dataExporter.exportCompanies(filters, options, userId);

export const exportSearchAnalytics = (userId: string, options: Partial<ExportOptions> = {}) =>
  dataExporter.exportSearchAnalytics(userId, options);

export const exportUserAnalytics = (targetUserId: string, options: Partial<ExportOptions> = {}, requestingUserId?: string) =>
  dataExporter.exportUserAnalytics(targetUserId, options, requestingUserId);