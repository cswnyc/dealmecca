'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, AlertCircle, BarChart3, Upload } from 'lucide-react'

interface ImportResults {
  companiesCreated: number
  companiesUpdated: number
  contactsCreated: number
  contactsUpdated: number
  duplicatesFound: number
  merged: number
  errors: string[]
  warnings: string[]
  executionTime: number
}

interface ImportSummary {
  totalRecords: number
  successRate: number
  duplicatesHandled: number
  dataMerged: number
}

export default function EnhancedBulkImport() {
  const [isUploading, setIsUploading] = useState(false)
  const [results, setResults] = useState<ImportResults | null>(null)
  const [summary, setSummary] = useState<ImportSummary | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file')
      return
    }

    setIsUploading(true)
    setError(null)
    setResults(null)
    setSummary(null)
    setProgress(0)

    try {
      // Parse CSV file
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
        const record: any = {}
        headers.forEach((header, index) => {
          record[header] = values[index] || ''
        })
        return record
      })

      console.log('📊 Parsed CSV data:', data)

      // Simulate progress
      setProgress(25)

      // Send to enhanced bulk import API
      const response = await fetch('/api/admin/bulk-import/enhanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data })
      })

      setProgress(75)

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Import failed')
      }

      setProgress(100)
      setResults(result.results)
      setSummary(result.summary)
      
      console.log('✅ Enhanced bulk import completed:', result)

    } catch (err) {
      console.error('❌ Enhanced bulk import error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsUploading(false)
      // Reset progress after a delay
      setTimeout(() => setProgress(0), 2000)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Enhanced Bulk Import
          </CardTitle>
          <CardDescription>
            Upload CSV files with intelligent duplicate detection and data merging
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* File Upload */}
            <div>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Expected columns: companyName, firstName, lastName, title, email, domain, industry, department, seniority
              </p>
            </div>

            {/* Progress Bar */}
            {isUploading && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-center text-muted-foreground">
                  {progress < 25 ? 'Processing file...' :
                   progress < 75 ? 'Importing data...' :
                   progress < 100 ? 'Finalizing...' : 'Complete!'}
                </p>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-destructive">{error}</span>
              </div>
            )}

            {/* Results Display */}
            {results && summary && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-green-700">
                    Enhanced bulk import completed successfully! Processed {summary.totalRecords} records 
                    with {summary.successRate}% success rate.
                  </span>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{results.companiesCreated}</div>
                      <div className="text-sm text-muted-foreground">Companies Created</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{results.companiesUpdated}</div>
                      <div className="text-sm text-muted-foreground">Companies Updated</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{results.contactsCreated}</div>
                      <div className="text-sm text-muted-foreground">Contacts Created</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{results.contactsUpdated}</div>
                      <div className="text-sm text-muted-foreground">Contacts Updated</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Detailed Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Import Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-lg font-semibold">{summary.duplicatesHandled}</div>
                        <div className="text-sm text-muted-foreground">Duplicates Found</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{summary.dataMerged}</div>
                        <div className="text-sm text-muted-foreground">Records Merged</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{results.executionTime}ms</div>
                        <div className="text-sm text-muted-foreground">Processing Time</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Errors and Warnings */}
                {(results.errors.length > 0 || results.warnings.length > 0) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Issues</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {results.errors.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-red-600 mb-2">Errors ({results.errors.length})</h4>
                          <ul className="text-sm space-y-1">
                            {results.errors.slice(0, 10).map((error, index) => (
                              <li key={index} className="text-red-600">• {error}</li>
                            ))}
                            {results.errors.length > 10 && (
                              <li className="text-muted-foreground">... and {results.errors.length - 10} more</li>
                            )}
                          </ul>
                        </div>
                      )}
                      
                      {results.warnings.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-yellow-600 mb-2">Warnings ({results.warnings.length})</h4>
                          <ul className="text-sm space-y-1">
                            {results.warnings.slice(0, 10).map((warning, index) => (
                              <li key={index} className="text-yellow-600">• {warning}</li>
                            ))}
                            {results.warnings.length > 10 && (
                              <li className="text-muted-foreground">... and {results.warnings.length - 10} more</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
