'use client';

import { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  Check, 
  X, 
  AlertTriangle, 
  Users, 
  Eye,
  Download,
  RefreshCw,
  Building2,
  Mail,
  Phone,
  Linkedin,
  User
} from 'lucide-react';

interface CSVRow {
  [key: string]: string;
}

interface ParsedContact {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  department?: string;
  company: string;
  companyId?: string;
  companyMatch?: 'exact' | 'fuzzy' | 'none';
  companyMatchedName?: string;
  errors: string[];
  warnings: string[];
  isValid: boolean;
}

interface ParsedData {
  contacts: ParsedContact[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
    warnings: number;
  };
  fieldMapping: { [key: string]: string };
}

interface Company {
  id: string;
  name: string;
  type: string;
}

const REQUIRED_FIELDS = ['firstName', 'lastName', 'title', 'company'];
const OPTIONAL_FIELDS = ['email', 'phone', 'linkedinUrl', 'department'];
const ALL_FIELDS = [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS];

// Validation patterns
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[\+]?[1-9][\d]{0,15}$/;
const LINKEDIN_PATTERN = /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/;

export function ContactCSVImport() {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [importResults, setImportResults] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load companies for matching
  const loadCompanies = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/companies');
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.companies || []);
      }
    } catch (error) {
      console.error('Failed to load companies:', error);
    }
  }, []);

  // Parse CSV content
  const parseCSV = (content: string): CSVRow[] => {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/['"]/g, ''));
    const rows: CSVRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/['"]/g, ''));
      const row: CSVRow = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      rows.push(row);
    }

    return rows;
  };

  // Match company by name or ID
  const matchCompany = (companyValue: string): { id?: string; match: 'exact' | 'fuzzy' | 'none'; matchedName?: string } => {
    if (!companyValue) return { match: 'none' };

    // Try exact ID match first
    const idMatch = companies.find(c => c.id === companyValue);
    if (idMatch) {
      return { id: idMatch.id, match: 'exact', matchedName: idMatch.name };
    }

    // Try exact name match
    const exactMatch = companies.find(c => c.name.toLowerCase() === companyValue.toLowerCase());
    if (exactMatch) {
      return { id: exactMatch.id, match: 'exact', matchedName: exactMatch.name };
    }

    // Try fuzzy name match
    const fuzzyMatch = companies.find(c => 
      c.name.toLowerCase().includes(companyValue.toLowerCase()) ||
      companyValue.toLowerCase().includes(c.name.toLowerCase())
    );
    if (fuzzyMatch) {
      return { id: fuzzyMatch.id, match: 'fuzzy', matchedName: fuzzyMatch.name };
    }

    return { match: 'none' };
  };

  // Validate contact data
  const validateContact = (contact: Partial<ParsedContact>): { errors: string[]; warnings: string[] } => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required field validation
    REQUIRED_FIELDS.forEach(field => {
      if (!contact[field as keyof ParsedContact] || contact[field as keyof ParsedContact] === '') {
        errors.push(`${field} is required`);
      }
    });

    // Email validation
    if (contact.email && !EMAIL_PATTERN.test(contact.email)) {
      errors.push('Invalid email format');
    }

    // Phone validation
    if (contact.phone && !PHONE_PATTERN.test(contact.phone)) {
      warnings.push('Phone number format may be invalid');
    }

    // LinkedIn validation
    if (contact.linkedinUrl && !LINKEDIN_PATTERN.test(contact.linkedinUrl)) {
      warnings.push('LinkedIn URL format may be invalid');
    }

    // Length validations
    if (contact.firstName && contact.firstName.length < 2) {
      errors.push('First name must be at least 2 characters');
    }
    if (contact.lastName && contact.lastName.length < 2) {
      errors.push('Last name must be at least 2 characters');
    }

    return { errors, warnings };
  };

  // Process CSV data
  const processCSVData = useCallback(async (csvRows: CSVRow[]) => {
    setIsParsing(true);
    
    await loadCompanies();

    const contacts: ParsedContact[] = [];
    const fieldMapping: { [key: string]: string } = {};

    // Auto-detect field mapping
    const headers = Object.keys(csvRows[0] || {});
    ALL_FIELDS.forEach(field => {
      const header = headers.find(h => 
        h.toLowerCase() === field.toLowerCase() ||
        h.toLowerCase().replace(/[_\s]/g, '') === field.toLowerCase()
      );
      if (header) {
        fieldMapping[field] = header;
      }
    });

    // Process each row
    csvRows.forEach((row, index) => {
      const contact: Partial<ParsedContact> = {
        id: `import-${index}`,
        firstName: row[fieldMapping.firstName] || '',
        lastName: row[fieldMapping.lastName] || '',
        title: row[fieldMapping.title] || '',
        email: row[fieldMapping.email] || '',
        phone: row[fieldMapping.phone] || '',
        linkedinUrl: row[fieldMapping.linkedinUrl] || '',
        department: row[fieldMapping.department] || '',
        company: row[fieldMapping.company] || '',
      };

      // Company matching
      const companyMatch = matchCompany(contact.company || '');
      contact.companyId = companyMatch.id;
      contact.companyMatch = companyMatch.match;
      contact.companyMatchedName = companyMatch.matchedName;

      // Validation
      const validation = validateContact(contact);
      contact.errors = validation.errors;
      contact.warnings = validation.warnings;
      contact.isValid = validation.errors.length === 0;

      contacts.push(contact as ParsedContact);
    });

    const summary = {
      total: contacts.length,
      valid: contacts.filter(c => c.isValid).length,
      invalid: contacts.filter(c => !c.isValid).length,
      warnings: contacts.filter(c => c.warnings.length > 0).length,
    };

    setParsedData({ contacts, summary, fieldMapping });
    setIsParsing(false);
    setShowPreview(true);
  }, [companies]);

  // Handle file upload
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
    setIsUploading(true);
    
    try {
      const content = await selectedFile.text();
      const rows = parseCSV(content);
      setCsvData(rows);
      await processCSVData(rows);
    } catch (error) {
      console.error('Error processing CSV:', error);
      alert('Error processing CSV file');
    } finally {
      setIsUploading(false);
    }
  }, [processCSVData]);

  // Handle bulk import
  const handleBulkImport = async () => {
    if (!parsedData) return;

    const validContacts = parsedData.contacts.filter(c => c.isValid);
    if (validContacts.length === 0) {
      alert('No valid contacts to import');
      return;
    }

    setIsImporting(true);
    
    try {
      const response = await fetch('/api/admin/contacts/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts: validContacts }),
      });

      if (response.ok) {
        const results = await response.json();
        setImportResults(results);
        alert(`Successfully imported ${results.imported} contacts`);
        
        // Reset form
        setFile(null);
        setCsvData([]);
        setParsedData(null);
        setShowPreview(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        const error = await response.json();
        alert(`Import failed: ${error.message}`);
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('Import failed due to network error');
    } finally {
      setIsImporting(false);
    }
  };

  // Generate sample CSV
  const generateSampleCSV = () => {
    const sampleData = [
      'firstName,lastName,title,company,email,phone,linkedinUrl,department',
      'John,Doe,VP Marketing,Acme Corp,john.doe@acmecorp.com,+1234567890,https://linkedin.com/in/johndoe,Marketing',
      'Jane,Smith,Software Engineer,Tech Inc,jane.smith@techinc.com,+1987654321,https://linkedin.com/in/janesmith,Engineering',
      'Bob,Johnson,Sales Director,Global Sales,bob.johnson@globalsales.com,+1122334455,https://linkedin.com/in/bobjohnson,Sales'
    ].join('\n');
    
    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contact-import-sample.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload CSV File
          </CardTitle>
          <CardDescription>
            Select a CSV file containing contact data to import
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="csv-file">Choose CSV File</Label>
                <Input
                  id="csv-file"
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={isUploading || isParsing}
                  className="mt-1"
                />
              </div>
              <Button
                variant="outline"
                onClick={generateSampleCSV}
                className="self-end"
              >
                <Download className="h-4 w-4 mr-2" />
                Sample CSV
              </Button>
            </div>

            {isUploading && (
              <div className="flex items-center gap-2 text-primary">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Uploading file...</span>
              </div>
            )}

            {isParsing && (
              <div className="flex items-center gap-2 text-primary">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Processing CSV data...</span>
              </div>
            )}

            {file && !isUploading && !isParsing && (
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">{file.name}</span>
                  <Badge variant="secondary">{csvData.length} rows</Badge>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      {showPreview && parsedData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Import Preview
            </CardTitle>
            <CardDescription>
              Review the parsed data before importing
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-primary/10 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-2xl font-bold text-primary">{parsedData.summary.total}</div>
                    <div className="text-sm text-primary">Total Contacts</div>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold text-green-900">{parsedData.summary.valid}</div>
                    <div className="text-sm text-green-600">Valid</div>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <X className="h-5 w-5 text-red-600" />
                  <div>
                    <div className="text-2xl font-bold text-red-900">{parsedData.summary.invalid}</div>
                    <div className="text-sm text-red-600">Invalid</div>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <div className="text-2xl font-bold text-yellow-900">{parsedData.summary.warnings}</div>
                    <div className="text-sm text-yellow-600">Warnings</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-96 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Name</th>
                      <th className="text-left p-3 font-medium">Title</th>
                      <th className="text-left p-3 font-medium">Company</th>
                      <th className="text-left p-3 font-medium">Contact</th>
                      <th className="text-left p-3 font-medium">Issues</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.contacts.slice(0, 50).map((contact, index) => (
                      <tr key={contact.id} className={index % 2 === 0 ? 'bg-muted' : 'bg-card'}>
                        <td className="p-3">
                          {contact.isValid ? (
                            <Badge className="bg-green-100 text-green-800">
                              <Check className="h-3 w-3 mr-1" />
                              Valid
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">
                              <X className="h-3 w-3 mr-1" />
                              Invalid
                            </Badge>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{contact.firstName} {contact.lastName}</span>
                          </div>
                        </td>
                        <td className="p-3">{contact.title}</td>
                        <td className="p-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span>{contact.company}</span>
                            </div>
                            {contact.companyMatch === 'exact' && (
                              <Badge className="bg-green-100 text-green-800 text-xs">Matched</Badge>
                            )}
                            {contact.companyMatch === 'fuzzy' && (
                              <Badge className="bg-yellow-100 text-yellow-800 text-xs">Fuzzy Match</Badge>
                            )}
                            {contact.companyMatch === 'none' && (
                              <Badge className="bg-red-100 text-red-800 text-xs">No Match</Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="space-y-1">
                            {contact.email && (
                              <div className="flex items-center gap-1 text-xs">
                                <Mail className="h-3 w-3" />
                                {contact.email}
                              </div>
                            )}
                            {contact.phone && (
                              <div className="flex items-center gap-1 text-xs">
                                <Phone className="h-3 w-3" />
                                {contact.phone}
                              </div>
                            )}
                            {contact.linkedinUrl && (
                              <div className="flex items-center gap-1 text-xs">
                                <Linkedin className="h-3 w-3" />
                                LinkedIn
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="space-y-1">
                            {contact.errors.map((error, idx) => (
                              <div key={idx} className="text-xs text-red-600 flex items-center gap-1">
                                <X className="h-3 w-3" />
                                {error}
                              </div>
                            ))}
                            {contact.warnings.map((warning, idx) => (
                              <div key={idx} className="text-xs text-yellow-600 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                {warning}
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedData.contacts.length > 50 && (
                <div className="p-3 bg-muted text-sm text-muted-foreground text-center">
                  Showing first 50 of {parsedData.contacts.length} contacts
                </div>
              )}
            </div>

            {/* Import Actions */}
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-muted-foreground">
                {parsedData.summary.valid} valid contacts ready for import
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPreview(false);
                    setParsedData(null);
                    setFile(null);
                    setCsvData([]);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkImport}
                  disabled={isImporting || parsedData.summary.valid === 0}
                >
                  {isImporting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Import {parsedData.summary.valid} Contacts
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Results */}
      {importResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              Import Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-green-800">
                Successfully imported {importResults.imported} contacts
              </div>
              {importResults.errors && importResults.errors.length > 0 && (
                <div className="mt-2 text-red-600 text-sm">
                  {importResults.errors.length} errors occurred during import
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 