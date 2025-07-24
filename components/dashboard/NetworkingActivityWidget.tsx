'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity,
  Building2,
  Users,
  MessageSquare,
  Calendar,
  Eye,
  TrendingUp,
  Award,
  Target,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ExternalLink
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface NetworkingActivity {
  id: string;
  interactionType: string;
  createdAt: string;
  company?: {
    id: string;
    name: string;
    logoUrl?: string;
    verified: boolean;
    companyType?: string;
    industry?: string;
  };
  metadata?: {
    companyName?: string;
    contactName?: string;
    eventName?: string;
    postTitle?: string;
    [key: string]: any;
  };
}

interface ActivitySummary {
  totalActivities: number;
  thisMonthActivities: number;
  uniqueCompanies: number;
  activityBreakdown: Array<{
    type: string;
    count: number;
  }>;
}

interface NetworkingActivityWidgetProps {
  userId?: string;
  className?: string;
  showHeader?: boolean;
}

export function NetworkingActivityWidget({ 
  userId, 
  className = "",
  showHeader = true 
}: NetworkingActivityWidgetProps) {
  const [activities, setActivities] = useState<NetworkingActivity[]>([]);
  const [summary, setSummary] = useState<ActivitySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('recent');

  useEffect(() => {
    fetchNetworkingData();
  }, [userId]);

  const fetchNetworkingData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/networking/activity?limit=20');
      
      if (!response.ok) {
        throw new Error('Failed to fetch networking activities');
      }
      
      const data = await response.json();
      setActivities(data.activities || []);
      setSummary(data.summary);
    } catch (error) {
      console.error('Error fetching networking data:', error);
      setError('Failed to load networking activities');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'COMPANY_PROFILE_VIEWED':
      case 'CONTACT_PROFILE_VIEWED':
        return <Eye className="w-4 h-4" />;
      case 'FORUM_POST_CREATED':
      case 'FORUM_COMMENT_POSTED':
      case 'DISCUSSION_PARTICIPATED':
        return <MessageSquare className="w-4 h-4" />;
      case 'COMPANY_MENTIONED':
      case 'CONTACT_MENTIONED':
        return <Building2 className="w-4 h-4" />;
      case 'NETWORKING_EVENT_JOINED':
        return <Calendar className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'COMPANY_PROFILE_VIEWED':
      case 'CONTACT_PROFILE_VIEWED':
        return 'text-blue-600 bg-blue-50';
      case 'FORUM_POST_CREATED':
      case 'DISCUSSION_PARTICIPATED':
        return 'text-green-600 bg-green-50';
      case 'COMPANY_MENTIONED':
      case 'CONTACT_MENTIONED':
        return 'text-purple-600 bg-purple-50';
      case 'NETWORKING_EVENT_JOINED':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatActivityType = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'COMPANY_PROFILE_VIEWED': 'Viewed Company',
      'CONTACT_PROFILE_VIEWED': 'Viewed Contact',
      'FORUM_POST_CREATED': 'Created Post',
      'FORUM_COMMENT_POSTED': 'Posted Comment',
      'COMPANY_MENTIONED': 'Mentioned Company',
      'CONTACT_MENTIONED': 'Mentioned Contact',
      'NETWORKING_EVENT_JOINED': 'Joined Event',
      'DISCUSSION_PARTICIPATED': 'Joined Discussion',
      'EXPERTISE_SHARED': 'Shared Expertise',
      'QUESTION_ANSWERED': 'Answered Question',
      'OPPORTUNITY_SHARED': 'Shared Opportunity'
    };
    return typeMap[type] || type.replace(/_/g, ' ');
  };

  const getGoalProgress = () => {
    if (!summary) return { percentage: 0, goal: 100 };
    // Use a default annual networking goal of 100 unique company interactions
    const goal = 100;
    const percentage = Math.min((summary.uniqueCompanies / goal) * 100, 100);
    return { percentage, goal };
  };

  if (loading) {
    return (
      <Card className={className}>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Networking Activity</span>
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="space-y-4 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        {showHeader && (
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Networking Activity</span>
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-6">
            <p className="text-red-600 text-sm">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchNetworkingData}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const goalProgress = getGoalProgress();

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Networking Activity</span>
            </div>
            <Link href="/dashboard/networking" className="text-blue-600 hover:text-blue-800">
              <ExternalLink className="w-4 h-4" />
            </Link>
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="recent" className="space-y-4">
            {activities.length > 0 ? (
              <div className="space-y-3">
                {activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-full ${getActivityColor(activity.interactionType)}`}>
                      {getActivityIcon(activity.interactionType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {formatActivityType(activity.interactionType)}
                        </p>
                        <span className="text-xs text-gray-500 flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDistanceToNow(new Date(activity.createdAt))} ago</span>
                        </span>
                      </div>
                      
                      {activity.company && (
                        <div className="flex items-center space-x-2 mt-1">
                          {activity.company.logoUrl ? (
                            <img 
                              src={activity.company.logoUrl} 
                              alt={activity.company.name}
                              className="w-4 h-4 rounded-sm object-cover"
                            />
                          ) : (
                            <Building2 className="w-4 h-4 text-gray-400" />
                          )}
                          <span className="text-xs text-gray-600 font-medium">
                            {activity.company.name}
                          </span>
                          {activity.company.verified && (
                            <CheckCircle2 className="w-3 h-3 text-blue-500" />
                          )}
                        </div>
                      )}
                      
                      {activity.metadata && (
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {activity.metadata.eventName || activity.metadata.postTitle || activity.metadata.contactName || ''}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                {activities.length > 5 && (
                  <div className="text-center">
                    <Link href="/dashboard/networking">
                      <Button variant="outline" size="sm" className="w-full">
                        View All Activities ({activities.length})
                        <ArrowUpRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">No networking activities yet</p>
                <p className="text-gray-500 text-xs mt-1">
                  Start by viewing company profiles or joining discussions
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            {summary && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-900">{summary.thisMonthActivities}</div>
                  <div className="text-xs text-blue-600">This Month</div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <Building2 className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-900">{summary.uniqueCompanies}</div>
                  <div className="text-xs text-green-600">Companies</div>
                </div>
              </div>
            )}
            
            {summary?.activityBreakdown && summary.activityBreakdown.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-700">Activity Breakdown</h4>
                {summary.activityBreakdown.slice(0, 4).map((item) => (
                  <div key={item.type} className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">
                      {formatActivityType(item.type)}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {item.count}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="goals" className="space-y-4">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Annual Networking Goal</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {summary?.uniqueCompanies || 0} / {goalProgress.goal}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${goalProgress.percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {goalProgress.percentage.toFixed(0)}% complete
                </p>
              </div>

              {goalProgress.percentage >= 100 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Goal Achieved!</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Congratulations on reaching your networking goal
                  </p>
                </div>
              )}

              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Actions</h4>
                <div className="space-y-2">
                  <Link href="/orgs" className="block">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Building2 className="w-4 h-4 mr-2" />
                      Explore Companies
                    </Button>
                  </Link>
                  <Link href="/forum" className="block">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Join Discussions
                    </Button>
                  </Link>
                  <Link href="/events" className="block">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Calendar className="w-4 h-4 mr-2" />
                      Find Events
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 