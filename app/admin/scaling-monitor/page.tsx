'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  TrendingUp, 
  Database, 
  Clock, 
  Users, 
  Search,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  Target,
  Activity,
  Download,
  Plus
} from 'lucide-react'

interface BatchMetrics {
  batchNumber: number
  companyCount: number
  contactCount: number
  importDate: string
  importDuration: number
  successRate: number
  avgQueryTime: number
  avgPageLoad: number
  mobileScore: number
  errorCount: number
  status: 'completed' | 'in_progress' | 'planned'
}

interface PerformanceGates {
  pageLoadTime: { threshold: 3000, current: number, passing: boolean }
  searchResponseTime: { threshold: 1000, current: number, passing: boolean }
  importSuccessRate: { threshold: 95, current: number, passing: boolean }
  mobileExperience: { threshold: 90, current: number, passing: boolean }
}

export default function ScalingMonitorPage() {
  const [currentBatch, setCurrentBatch] = useState(1)
  const [totalCompanies, setTotalCompanies] = useState(17)
  const [batches, setBatches] = useState<BatchMetrics[]>([])
  const [performanceGates, setPerformanceGates] = useState<PerformanceGates>({
    pageLoadTime: { threshold: 3000, current: 2100, passing: true },
    searchResponseTime: { threshold: 1000, current: 450, passing: true },
    importSuccessRate: { threshold: 95, current: 98.5, passing: true },
    mobileExperience: { threshold: 90, current: 95, passing: true }
  })
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    activeUsers: 3,
    queriesPerSecond: 1.2,
    dbConnections: 8,
    memoryUsage: 45
  })

  // Mock data for demonstration
  useEffect(() => {
    const mockBatches: BatchMetrics[] = [
      {
        batchNumber: 1,
        companyCount: 150,
        contactCount: 420,
        importDate: '2025-01-15',
        importDuration: 18,
        successRate: 98.7,
        avgQueryTime: 420,
        avgPageLoad: 2100,
        mobileScore: 95,
        errorCount: 2,
        status: 'completed'
      }
    ]
    setBatches(mockBatches)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'planned': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getGateStatusIcon = (passing: boolean) => {
    return passing ? 
      <CheckCircle className="h-5 w-5 text-green-600" /> : 
      <AlertTriangle className="h-5 w-5 text-red-600" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Scaling Monitor</h1>
          <p className="text-gray-600">Track batch imports and system performance during scale-up</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Start New Batch
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompanies.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{totalCompanies - 17} from baseline
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Batch</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Batch {currentBatch}</div>
            <p className="text-xs text-muted-foreground">
              Target: 1000+ companies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Query Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceGates.searchResponseTime.current}ms</div>
            <p className="text-xs text-green-600">
              Well under 1s target
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performanceGates.importSuccessRate.current}%</div>
            <p className="text-xs text-green-600">
              Above 95% target
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Gates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Performance Gates</span>
          </CardTitle>
          <CardDescription>
            All gates must pass before proceeding to next batch
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(performanceGates).map(([key, gate]) => (
              <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getGateStatusIcon(gate.passing)}
                  <div>
                    <p className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                    <p className="text-sm text-gray-600">
                      Current: {gate.current}{key.includes('Time') ? 'ms' : key.includes('Rate') ? '%' : ''}
                      {' '}/ Target: {gate.threshold}{key.includes('Time') ? 'ms' : key.includes('Rate') ? '%' : ''}
                    </p>
                  </div>
                </div>
                <Badge className={gate.passing ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {gate.passing ? 'Pass' : 'Fail'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="batches" className="space-y-4">
        <TabsList>
          <TabsTrigger value="batches">Batch History</TabsTrigger>
          <TabsTrigger value="performance">Performance Trends</TabsTrigger>
          <TabsTrigger value="realtime">Real-time Monitoring</TabsTrigger>
          <TabsTrigger value="insights">Learning Insights</TabsTrigger>
        </TabsList>

        {/* Batch History Tab */}
        <TabsContent value="batches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import Batch History</CardTitle>
              <CardDescription>Track progress and performance of each batch import</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {batches.map((batch) => (
                  <div key={batch.batchNumber} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold">Batch {batch.batchNumber}</h3>
                        <Badge className={getStatusColor(batch.status)}>
                          {batch.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-600">{batch.importDate}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{batch.companyCount}</p>
                        <p className="text-sm text-gray-600">Companies</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{batch.contactCount}</p>
                        <p className="text-sm text-gray-600">Contacts</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">{batch.importDuration}m</p>
                        <p className="text-sm text-gray-600">Duration</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">{batch.successRate}%</p>
                        <p className="text-sm text-gray-600">Success</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded p-3">
                      <h4 className="font-medium mb-2">Performance Metrics</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>Avg Query: {batch.avgQueryTime}ms</div>
                        <div>Page Load: {batch.avgPageLoad}ms</div>
                        <div>Mobile Score: {batch.mobileScore}</div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Planned Batches */}
                {[2, 3, 4, 5].map((batchNum) => (
                  <div key={batchNum} className="border border-dashed rounded-lg p-4 opacity-60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold">Batch {batchNum}</h3>
                        <Badge className="bg-gray-100 text-gray-600">Planned</Badge>
                      </div>
                      <span className="text-sm text-gray-400">
                        Target: {100 + (batchNum - 1) * 50}-{150 + (batchNum - 1) * 50} companies
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Trends Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Query Performance Trend</CardTitle>
                <CardDescription>Average search response times over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded">
                  <div className="text-center">
                    <BarChart3 className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600">Performance chart will appear here</p>
                    <p className="text-sm text-gray-500">After batch imports begin</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Volume Impact</CardTitle>
                <CardDescription>Performance vs company count</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded">
                  <div className="text-center">
                    <TrendingUp className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600">Volume impact chart will appear here</p>
                    <p className="text-sm text-gray-500">Shows scaling performance</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Real-time Monitoring Tab */}
        <TabsContent value="realtime" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Active Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{realTimeMetrics.activeUsers}</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Search className="h-4 w-4 mr-2" />
                  Queries/sec
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{realTimeMetrics.queriesPerSecond}</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Database className="h-4 w-4 mr-2" />
                  DB Connections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{realTimeMetrics.dbConnections}/20</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Activity className="h-4 w-4 mr-2" />
                  Memory Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{realTimeMetrics.memoryUsage}%</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${realTimeMetrics.memoryUsage}%` }}></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Current system health and performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="font-medium">Database</p>
                  <p className="text-sm text-green-600">Healthy</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="font-medium">Search Index</p>
                  <p className="text-sm text-green-600">Optimal</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="font-medium">API Response</p>
                  <p className="text-sm text-green-600">Fast</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Learning Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Batch Learning Insights</CardTitle>
              <CardDescription>Key learnings and optimization opportunities from each batch</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-semibold text-lg mb-2">Batch 1 Learnings</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Search performance remained stable with 150 additional companies</li>
                    <li>• Mobile experience maintained high scores across all tests</li>
                    <li>• Import process completed 18% faster than baseline estimates</li>
                    <li>• Users searched for "Media Director" 3x more than expected</li>
                  </ul>
                  <div className="mt-3">
                    <Badge className="bg-green-100 text-green-800 mr-2">Performance Stable</Badge>
                    <Badge className="bg-blue-100 text-blue-800">Search Patterns Identified</Badge>
                  </div>
                </div>

                <div className="border-l-4 border-gray-300 pl-4 opacity-60">
                  <h3 className="font-semibold text-lg mb-2">Batch 2 Learnings</h3>
                  <p className="text-sm text-gray-500">Will be populated after Batch 2 completion</p>
                </div>

                <div className="border-l-4 border-gray-300 pl-4 opacity-60">
                  <h3 className="font-semibold text-lg mb-2">Batch 3 Learnings</h3>
                  <p className="text-sm text-gray-500">Will be populated after Batch 3 completion</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Optimization Recommendations</CardTitle>
              <CardDescription>Suggested improvements based on current data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 border rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Implement Search Auto-complete</p>
                    <p className="text-sm text-gray-600">High frequency searches detected - add auto-complete for better UX</p>
                    <Badge className="mt-2 bg-blue-100 text-blue-800">Ready for Batch 2</Badge>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Smartphone className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Mobile Gesture Optimization</p>
                    <p className="text-sm text-gray-600">Mobile usage higher than expected - enhance swipe interactions</p>
                    <Badge className="mt-2 bg-green-100 text-green-800">In Progress</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}