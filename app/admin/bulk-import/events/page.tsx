'use client';

import { useState, useCallback } from 'react';
import { ArrowLeft, Upload, Calendar, CheckCircle, AlertTriangle, FileText, X } from 'lucide-react';
import Link from 'next/link';
import { useDropzone } from 'react-dropzone';

interface ParsedEvent {
  name: string;
  description?: string;
  website?: string;
  startDate: string;
  endDate: string;
  location: string;
  venue?: string;
  category: string;
  industry: string;
  estimatedCost?: number;
  isVirtual?: boolean;
  isHybrid?: boolean;
  organizerName?: string;
  organizerUrl?: string;
  registrationUrl?: string;
  capacity?: number;
  eventType?: string;
  status?: string;
  _valid: boolean;
  _errors: string[];
}

interface ImportResults {
  created: number;
  skipped: number;
  errors: string[];
}

const VALID_CATEGORIES = ['CONFERENCE', 'TRADE_SHOW', 'SUMMIT', 'WORKSHOP', 'NETWORKING', 'AWARDS', 'WEBINAR', 'MASTERCLASS'];

function parseCategory(raw: string): string | null {
  if (!raw) return null;
  const normalized = raw.toUpperCase().replace(/[\s-]+/g, '_');
  if (VALID_CATEGORIES.includes(normalized)) return normalized;
  // Fuzzy match
  const map: Record<string, string> = {
    'TRADE SHOW': 'TRADE_SHOW', 'TRADESHOW': 'TRADE_SHOW', 'EXPO': 'TRADE_SHOW',
    'CONF': 'CONFERENCE', 'CONVENTION': 'CONFERENCE',
    'NETWORK': 'NETWORKING', 'MIXER': 'NETWORKING', 'MEETUP': 'NETWORKING',
    'AWARD': 'AWARDS', 'GALA': 'AWARDS',
    'WEBCAST': 'WEBINAR', 'ONLINE': 'WEBINAR',
    'CLASS': 'MASTERCLASS', 'TRAINING': 'MASTERCLASS',
  };
  for (const [key, val] of Object.entries(map)) {
    if (normalized.includes(key)) return val;
  }
  return 'CONFERENCE'; // default
}

function parseDate(raw: string): string | null {
  if (!raw) return null;
  const d = new Date(raw);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

function parseBool(raw: any): boolean {
  if (typeof raw === 'boolean') return raw;
  if (typeof raw === 'string') {
    return ['true', 'yes', '1', 'y'].includes(raw.toLowerCase().trim());
  }
  return false;
}

function validateEvent(row: Record<string, any>, index: number): ParsedEvent {
  const errors: string[] = [];
  const name = (row.name || row.Name || row.event_name || row['Event Name'] || '').trim();
  if (!name) errors.push(`Row ${index + 1}: Missing event name`);

  const startRaw = row.startDate || row.start_date || row['Start Date'] || row.date || row.Date || '';
  const endRaw = row.endDate || row.end_date || row['End Date'] || startRaw;
  const startDate = parseDate(startRaw);
  const endDate = parseDate(endRaw);
  if (!startDate) errors.push(`Row ${index + 1}: Invalid start date "${startRaw}"`);

  const location = (row.location || row.Location || row.city || row.City || '').trim();
  if (!location) errors.push(`Row ${index + 1}: Missing location`);

  const categoryRaw = row.category || row.Category || row.type || row.Type || '';
  const category = parseCategory(categoryRaw);

  const industry = (row.industry || row.Industry || 'MEDIA_ENTERTAINMENT').trim();

  return {
    name,
    description: (row.description || row.Description || '').trim() || undefined,
    website: (row.website || row.Website || row.url || row.URL || '').trim() || undefined,
    startDate: startDate || '',
    endDate: endDate || startDate || '',
    location,
    venue: (row.venue || row.Venue || '').trim() || undefined,
    category: category || 'CONFERENCE',
    industry,
    estimatedCost: row.estimatedCost || row.estimated_cost || row.cost || row.Cost ? parseInt(row.estimatedCost || row.estimated_cost || row.cost || row.Cost) || undefined : undefined,
    isVirtual: parseBool(row.isVirtual || row.is_virtual || row.virtual || row.Virtual),
    isHybrid: parseBool(row.isHybrid || row.is_hybrid || row.hybrid || row.Hybrid),
    organizerName: (row.organizerName || row.organizer_name || row.organizer || row.Organizer || '').trim() || undefined,
    organizerUrl: (row.organizerUrl || row.organizer_url || row.organizerWebsite || '').trim() || undefined,
    registrationUrl: (row.registrationUrl || row.registration_url || row.registration || row.Registration || '').trim() || undefined,
    capacity: row.capacity || row.Capacity ? parseInt(row.capacity || row.Capacity) || undefined : undefined,
    eventType: (row.eventType || row.event_type || '').trim() || undefined,
    status: (row.status || row.Status || 'PUBLISHED').toUpperCase().trim(),
    _valid: errors.length === 0,
    _errors: errors,
  };
}

export default function BulkImportEventsPage() {
  const [step, setStep] = useState<'upload' | 'preview' | 'importing' | 'results'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [parsedEvents, setParsedEvents] = useState<ParsedEvent[]>([]);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportResults | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const f = acceptedFiles[0];
    setFile(f);

    // Parse CSV client-side using PapaParse
    const Papa = (await import('papaparse')).default;
    Papa.parse(f, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const events = result.data.map((row: any, i: number) => validateEvent(row, i));
        setParsedEvents(events);
        setStep('preview');
      },
      error: (err) => {
        console.error('CSV parse error:', err);
      }
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
  });

  const validEvents = parsedEvents.filter(e => e._valid);
  const invalidEvents = parsedEvents.filter(e => !e._valid);

  const handleImport = async () => {
    if (validEvents.length === 0) return;
    setImporting(true);
    setStep('importing');

    try {
      // Get Firebase auth token
      const { getAuth } = await import('firebase/auth');
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Not authenticated');
      }
      const token = await user.getIdToken();

      const response = await fetch('/api/admin/bulk-import/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ events: validEvents }),
      });

      const data = await response.json();
      setResults(data);
      setStep('results');
    } catch (err) {
      console.error('Import error:', err);
      setResults({ created: 0, skipped: 0, errors: ['Import failed: ' + (err as Error).message] });
      setStep('results');
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsedEvents([]);
    setResults(null);
    setStep('upload');
  };

  return (
    <div className="min-h-screen bg-surface-light dark:bg-dark-bg">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Bulk Import Events</h1>
            <p className="text-muted-foreground text-sm">Upload a CSV file to import industry events</p>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center gap-2 mb-8">
          {['upload', 'preview', 'importing', 'results'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === s ? 'bg-brand-primary text-white' :
                ['upload', 'preview', 'importing', 'results'].indexOf(step) > i ? 'bg-green-500 text-white' :
                'bg-muted text-muted-foreground'
              }`}>
                {['upload', 'preview', 'importing', 'results'].indexOf(step) > i ? '✓' : i + 1}
              </div>
              <span className={`text-sm ${step === s ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </span>
              {i < 3 && <div className="w-8 h-px bg-border" />}
            </div>
          ))}
        </div>

        {/* Upload Step */}
        {step === 'upload' && (
          <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl p-8">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-brand-primary bg-brand-primary/5' : 'border-border hover:border-brand-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">
                {isDragActive ? 'Drop your CSV here' : 'Drag & drop a CSV file'}
              </p>
              <p className="text-muted-foreground text-sm mb-4">or click to browse</p>
              <p className="text-xs text-muted-foreground">Supports .csv files</p>
            </div>

            {/* CSV Format Guide */}
            <div className="mt-8 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" /> Expected CSV Columns
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                <div><span className="font-medium text-foreground">name</span> (required)</div>
                <div><span className="font-medium text-foreground">startDate</span> (required)</div>
                <div><span className="font-medium text-foreground">location</span> (required)</div>
                <div>endDate</div>
                <div>category</div>
                <div>industry</div>
                <div>description</div>
                <div>website</div>
                <div>venue</div>
                <div>estimatedCost</div>
                <div>organizerName</div>
                <div>registrationUrl</div>
                <div>capacity</div>
                <div>isVirtual</div>
                <div>isHybrid</div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Categories: {VALID_CATEGORIES.join(', ')}
              </p>
            </div>
          </div>
        )}

        {/* Preview Step */}
        {step === 'preview' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl p-4">
                <div className="text-3xl font-bold text-foreground">{parsedEvents.length}</div>
                <div className="text-sm text-muted-foreground">Total Events</div>
              </div>
              <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl p-4">
                <div className="text-3xl font-bold text-green-600">{validEvents.length}</div>
                <div className="text-sm text-muted-foreground">Valid</div>
              </div>
              <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl p-4">
                <div className="text-3xl font-bold text-red-500">{invalidEvents.length}</div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
            </div>

            {/* Errors */}
            {invalidEvents.length > 0 && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <h3 className="font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> Validation Errors
                </h3>
                <ul className="text-sm text-red-600 dark:text-red-400 space-y-1 max-h-40 overflow-y-auto">
                  {invalidEvents.flatMap(e => e._errors).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Preview Table */}
            <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border dark:border-dark-border bg-muted/30">
                      <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Location</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Category</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validEvents.slice(0, 20).map((event, i) => (
                      <tr key={i} className="border-b border-border/50 dark:border-dark-border/50">
                        <td className="p-3 font-medium text-foreground">{event.name}</td>
                        <td className="p-3 text-muted-foreground">
                          {event.startDate ? new Date(event.startDate).toLocaleDateString() : '—'}
                        </td>
                        <td className="p-3 text-muted-foreground">{event.location}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-muted rounded text-xs">{event.category}</span>
                        </td>
                        <td className="p-3">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {validEvents.length > 20 && (
                  <div className="p-3 text-center text-sm text-muted-foreground">
                    ...and {validEvents.length - 20} more events
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-muted-foreground hover:text-foreground text-sm"
              >
                ← Back to Upload
              </button>
              <button
                onClick={handleImport}
                disabled={validEvents.length === 0}
                className="px-6 py-2 bg-brand-primary text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                Import {validEvents.length} Events
              </button>
            </div>
          </div>
        )}

        {/* Importing Step */}
        {step === 'importing' && (
          <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl p-12 text-center">
            <div className="animate-spin h-12 w-12 border-4 border-brand-primary border-t-transparent rounded-full mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Importing Events...</h2>
            <p className="text-muted-foreground">Processing {validEvents.length} events</p>
          </div>
        )}

        {/* Results Step */}
        {step === 'results' && results && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Import Complete</h2>
              <div className="flex items-center justify-center gap-8 mt-6">
                <div>
                  <div className="text-3xl font-bold text-green-600">{results.created}</div>
                  <div className="text-sm text-muted-foreground">Created</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-yellow-600">{results.skipped}</div>
                  <div className="text-sm text-muted-foreground">Skipped</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-red-500">{results.errors.length}</div>
                  <div className="text-sm text-muted-foreground">Errors</div>
                </div>
              </div>
            </div>

            {results.errors.length > 0 && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <h3 className="font-semibold text-red-700 dark:text-red-400 mb-2">Errors</h3>
                <ul className="text-sm text-red-600 dark:text-red-400 space-y-1 max-h-40 overflow-y-auto">
                  {results.errors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-between">
              <button onClick={handleReset} className="px-4 py-2 text-muted-foreground hover:text-foreground text-sm">
                Import More
              </button>
              <Link
                href="/admin/events"
                className="px-6 py-2 bg-brand-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                View Events →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
