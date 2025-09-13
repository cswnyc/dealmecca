'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Activity, 
  Clock, 
  Database, 
  AlertTriangle, 
  TrendingUp, 
  Server,
  HardDrive,
  Zap,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react'

interface PerformanceMetrics {
  summary: {
    queries: { total: number; avgDuration: number; slowQueries: number };
    apis: { total: number; avgDuration: number; slowAPIs: number; errorRate: number };
    alerts: { total: number; unresolved: number };
    memory: { current: number; peak: number };
  };
  connectionPool: {
    activeConnections: number;
    timestamp: string;
    error?: string;
  };
  systemInfo: {
    nodeVersion: string;
    platform: string;
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
  };
}

interface PerformanceAlert {
  id: string;
  type: 'SLOW_QUERY' | 'HIGH_MEMORY' | 'ERROR_RATE' | 'CONNECTION_POOL';
  message: string;
  threshold: number;
  actualValue: number;
  timestamp: string;
  resolved: boolean;
}

interface QueryMetric {
  id: string;
  query: string;
  duration: number;
  timestamp: string;
  route: string;
  resultCount?: number;
  errorMessage?: string;
}

interface APIMetric {
  id: string;
  method: string;
  route: string;
  duration: number;
  statusCode: number;
  timestamp: string;
  memoryUsage?: NodeJS.MemoryUsage;
  errorMessage?: string;
}

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([])
  const [queries, setQueries] = useState<QueryMetric[]>([])
  const [apis, setAPIs] = useState<APIMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'summary' | 'queries' | 'apis' | 'alerts'>('summary')
  const [timeWindow, setTimeWindow] = useState(24)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const fetchData = async (type: string = 'summary') => {
    try {
      const response = await fetch(`/api/admin/performance?type=${type}&timeWindow=${timeWindow}`)
      const data = await response.json()
      
      if (data.success) {
        if (type === 'summary') {
          setMetrics(data.data)
        } else if (type === 'alerts') {
          setAlerts(data.data.alerts)
        } else if (type === 'queries') {
          setQueries(data.data.queries)
        } else if (type === 'apis') {
          setAPIs(data.data.apis)
        }
      }
    } catch (error) {
      console.error('Failed to fetch performance data:', error)
    }
  }

  const resolveAlert = async (alertId: string) => {
    try {
      const response = await fetch('/api/admin/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, action: 'resolve' })
      })
      
      if (response.ok) {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId))
      }
    } catch (error) {
      console.error('Failed to resolve alert:', error)
    }
  }

  const refreshData = () => {
    setLoading(true)
    fetchData(activeTab).finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData('summary').finally(() => setLoading(false))
  }, [timeWindow])

  useEffect(() => {
    if (activeTab !== 'summary') {
      fetchData(activeTab)
    }
  }, [activeTab])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchData(activeTab)
      }, 30000) // Refresh every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [activeTab, autoRefresh])

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(1)}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  const formatBytes = (bytes: number) => {
    const mb = bytes / 1024 / 1024
    return `${mb.toFixed(1)} MB`
  }

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'SLOW_QUERY': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'HIGH_MEMORY': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'ERROR_RATE': return 'bg-red-100 text-red-800 border-red-200'
      case 'CONNECTION_POOL': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPerformanceStatus = (avgDuration: number, threshold: number) => {
    if (avgDuration < threshold * 0.5) return { status: 'excellent', color: 'text-green-600' }
    if (avgDuration < threshold * 0.8) return { status: 'good', color: 'text-blue-600' }
    if (avgDuration < threshold) return { status: 'warning', color: 'text-yellow-600' }
    return { status: 'critical', color: 'text-red-600' }
  }

  if (loading && !metrics) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Loading performance data...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance Dashboard</h1>
          <p className="text-gray-600">Monitor system performance and database metrics</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select 
            value={timeWindow} 
            onChange={(e) => setTimeWindow(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value={1}>Last 1 hour</option>
            <option value={6}>Last 6 hours</option>
            <option value={24}>Last 24 hours</option>
            <option value={168}>Last 7 days</option>
          </select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 border-green-200' : ''}
          >
            <Activity className="h-4 w-4 mr-1" />
            Auto Refresh {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          
          <Button variant="outline" size="sm" onClick={refreshData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 border-b border-gray-200">
        {[
          { key: 'summary', label: 'Overview', icon: TrendingUp },
          { key: 'queries', label: 'Database Queries', icon: Database },
          { key: 'apis', label: 'API Performance', icon: Server },
          { key: 'alerts', label: 'Alerts', icon: AlertTriangle }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as typeof activeTab)}
            className={`flex items-center px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === key
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Icon className="h-4 w-4 mr-2" />
            {label}
          </button>
        ))}
      </div>

      {/* Summary Tab */}
      {activeTab === 'summary' && metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Database Performance */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Database className="h-4 w-4 mr-2" />
                Database Queries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {metrics.summary.queries.total}
                  </div>
                  <p className="text-sm text-gray-600">queries executed</p>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Avg Duration</span>
                    <span className={getPerformanceStatus(metrics.summary.queries.avgDuration, 1000).color}>
                      {formatDuration(metrics.summary.queries.avgDuration)}
                    </span>
                  </div>
                  <Progress 
                    value={Math.min((metrics.summary.queries.avgDuration / 1000) * 100, 100)}
                    className="h-2 mt-1"
                  />
                </div>
                
                {metrics.summary.queries.slowQueries > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Slow queries</span>
                    <Badge variant="destructive">{metrics.summary.queries.slowQueries}</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* API Performance */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Server className="h-4 w-4 mr-2" />
                API Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {metrics.summary.apis.total}
                  </div>
                  <p className="text-sm text-gray-600">API calls</p>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Avg Response</span>
                    <span className={getPerformanceStatus(metrics.summary.apis.avgDuration, 2000).color}>
                      {formatDuration(metrics.summary.apis.avgDuration)}
                    </span>
                  </div>
                  <Progress 
                    value={Math.min((metrics.summary.apis.avgDuration / 2000) * 100, 100)}
                    className="h-2 mt-1"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Error Rate</span>
                  <Badge variant={metrics.summary.apis.errorRate > 5 ? "destructive" : "secondary"}>
                    {metrics.summary.apis.errorRate.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* HardDrive Usage */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <HardDrive className="h-4 w-4 mr-2" />
                HardDrive Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatBytes(metrics.summary.memory.current * 1024 * 1024)}
                  </div>
                  <p className="text-sm text-gray-600">heap used</p>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Peak Usage</span>
                    <span className="text-gray-900">
                      {formatBytes(metrics.summary.memory.peak)}
                    </span>
                  </div>
                  <Progress 
                    value={(metrics.summary.memory.current / (metrics.summary.memory.peak / 1024 / 1024)) * 100}
                    className="h-2 mt-1"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">System Uptime</span>
                  <span className="text-sm text-gray-900">
                    {formatUptime(metrics.systemInfo.uptime)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                System Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {metrics.summary.alerts.unresolved}
                  </div>
                  <p className="text-sm text-gray-600">active alerts</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total alerts</span>
                    <span className="text-sm text-gray-900">{metrics.summary.alerts.total}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">DB Connections</span>
                    <span className="text-sm text-gray-900">
                      {metrics.connectionPool.activeConnections}
                    </span>
                  </div>
                </div>
                
                {metrics.summary.alerts.unresolved === 0 ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm">All systems normal</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <XCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm">Issues detected</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed tabs content would go here - queries, APIs, alerts */}
      {activeTab !== 'summary' && (
        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === 'queries' && 'Database Query Performance'}
              {activeTab === 'apis' && 'API Response Time Metrics'}
              {activeTab === 'alerts' && 'Performance Alerts'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Detailed {activeTab} view coming soon. The monitoring infrastructure is in place and collecting data.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}