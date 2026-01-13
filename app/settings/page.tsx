'use client';

import { useState, useEffect } from 'react';
import { useFirebaseAuth } from '@/lib/auth/firebase-auth';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/lib/theme-context';
import { useMobileOptimization } from '@/lib/mobile-performance';
import {
  User,
  Mail,
  Bell,
  Shield,
  Moon,
  Sun,
  Save,
  ArrowLeft,
  Settings as SettingsIcon,
  Key,
  Globe,
  Smartphone
} from 'lucide-react';
import Link from 'next/link';
import IdentityTab from '@/components/settings/IdentityTab';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PageFrame, PageHeader, PageContent, PageCard } from '@/components/layout/PageFrame';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface UserSettings {
  displayName: string;
  email: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  darkMode: boolean;
  language: string;
  timezone: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('identity');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { isMobile } = useMobileOptimization();
  const [settings, setSettings] = useState<UserSettings>({
    displayName: '',
    email: '',
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    darkMode: false,
    language: 'en',
    timezone: 'UTC'
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Get Firebase auth
  const { user, idToken, loading } = useFirebaseAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkAuthentication = async () => {
      // Check for LinkedIn session first
      try {
        const linkedinSession = localStorage.getItem('linkedin-session');
        if (linkedinSession) {
          const sessionData = JSON.parse(linkedinSession);

          // Validate session token hasn't expired
          if (sessionData.exp && Date.now() < sessionData.exp) {
            setIsAuthenticated(true);
            setUserProfile(sessionData);
            setSettings(prev => ({
              ...prev,
              displayName: sessionData.name || '',
              email: sessionData.email || ''
            }));
            setAuthLoading(false);
            return;
          } else {
            localStorage.removeItem('linkedin-session');
          }
        }
      } catch (error) {
        localStorage.removeItem('linkedin-session');
      }

      // Wait for Firebase auth to load if available
      if (loading) {
        return;
      }

      // Check for Firebase user as fallback
      if (user) {
        setIsAuthenticated(true);
        setUserProfile(user);
        setSettings(prev => ({
          ...prev,
          displayName: user.displayName || '',
          email: user.email || ''
        }));
        setAuthLoading(false);
        return;
      }

      // No authenticated user found
      setAuthLoading(false);
      router.replace('/auth/signup');
    };

    if (mounted) {
      checkAuthentication();
    }
  }, [user, loading, router, mounted]);

  // Fetch user preferences after authentication
  useEffect(() => {
    const fetchPreferences = async () => {
      if (!idToken || !isAuthenticated) return;

      try {
        const response = await fetch('/api/users/preferences', {
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const preferences = await response.json();
          setSettings(prev => ({
            ...prev,
            darkMode: preferences.darkMode ?? prev.darkMode,
            language: preferences.language ?? prev.language,
            timezone: preferences.timezone ?? prev.timezone,
            emailNotifications: preferences.emailNotifications ?? prev.emailNotifications,
            pushNotifications: preferences.pushNotifications ?? prev.pushNotifications,
            marketingEmails: preferences.marketingEmails ?? prev.marketingEmails
          }));
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
      }
    };

    fetchPreferences();
  }, [idToken, isAuthenticated]);

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Get Firebase ID token
      if (!idToken) {
        console.error('No Firebase ID token available');
        return;
      }

      // Save preferences to API
      const response = await fetch('/api/users/preferences', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          darkMode: settings.darkMode,
          language: settings.language,
          timezone: settings.timezone,
          emailNotifications: settings.emailNotifications,
          pushNotifications: settings.pushNotifications,
          marketingEmails: settings.marketingEmails
        })
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        console.error('Failed to save preferences:', response.status);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const { theme: currentTheme, toggleTheme } = useTheme();

  // Sync theme state with settings
  useEffect(() => {
    if (currentTheme) {
      setSettings(prev => ({
        ...prev,
        darkMode: currentTheme === 'dark'
      }));
    }
  }, [currentTheme]);

  if (!mounted || authLoading) {
    return (
      <PageFrame maxWidth="4xl">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </PageFrame>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const tabOptions = [
    { value: 'identity', label: 'Identity', icon: User },
    { value: 'profile', label: 'Profile', icon: Mail },
    { value: 'notifications', label: 'Notifications', icon: Bell },
    { value: 'preferences', label: 'Preferences', icon: Globe },
    { value: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <AuthGuard>
    <PageFrame maxWidth="4xl">
      <PageHeader
        title="Settings"
        description="Manage your account preferences and settings"
        actions={
          <>
            <Button variant="ghost" asChild className="md:inline-flex">
              <Link href="/forum">
                <ArrowLeft className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Back</span>
              </Link>
            </Button>
            {activeTab !== 'identity' && saved && (
              <span className="text-green-600 text-sm font-medium hidden sm:inline">Saved!</span>
            )}
            {activeTab !== 'identity' && (
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full sm:w-auto"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
          </>
        }
      />

      <PageContent className="pb-24 sm:pb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Mobile: Dropdown selector */}
          {isMobile ? (
            <div className="mb-6 sm:hidden">
              <Label htmlFor="section-select" className="text-sm font-medium mb-2 block">Section</Label>
              <Select id="section-select" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                {tabOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </Select>
            </div>
          ) : (
            /* Desktop: Horizontal tab bar */
            <TabsList className="mb-6 hidden sm:flex border-b border-[#E6EAF2] dark:border-dark-border bg-transparent p-0 h-auto rounded-none">
              <TabsTrigger value="identity" className="flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors bg-transparent shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-[#2575FC] dark:data-[state=active]:text-[#5B8DFF] data-[state=active]:border-b-2 data-[state=active]:border-[#2575FC] dark:data-[state=active]:border-[#5B8DFF] text-[#64748B] dark:text-[#9AA7C2] hover:text-[#2575FC] dark:hover:text-[#5B8DFF] rounded-none border-b-2 border-transparent">
                <User className="w-4 h-4" />
                <span>Identity</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors bg-transparent shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-[#2575FC] dark:data-[state=active]:text-[#5B8DFF] data-[state=active]:border-b-2 data-[state=active]:border-[#2575FC] dark:data-[state=active]:border-[#5B8DFF] text-[#64748B] dark:text-[#9AA7C2] hover:text-[#2575FC] dark:hover:text-[#5B8DFF] rounded-none border-b-2 border-transparent">
                <Mail className="w-4 h-4" />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors bg-transparent shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-[#2575FC] dark:data-[state=active]:text-[#5B8DFF] data-[state=active]:border-b-2 data-[state=active]:border-[#2575FC] dark:data-[state=active]:border-[#5B8DFF] text-[#64748B] dark:text-[#9AA7C2] hover:text-[#2575FC] dark:hover:text-[#5B8DFF] rounded-none border-b-2 border-transparent">
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors bg-transparent shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-[#2575FC] dark:data-[state=active]:text-[#5B8DFF] data-[state=active]:border-b-2 data-[state=active]:border-[#2575FC] dark:data-[state=active]:border-[#5B8DFF] text-[#64748B] dark:text-[#9AA7C2] hover:text-[#2575FC] dark:hover:text-[#5B8DFF] rounded-none border-b-2 border-transparent">
                <Globe className="w-4 h-4" />
                <span>Preferences</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors bg-transparent shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-[#2575FC] dark:data-[state=active]:text-[#5B8DFF] data-[state=active]:border-b-2 data-[state=active]:border-[#2575FC] dark:data-[state=active]:border-[#5B8DFF] text-[#64748B] dark:text-[#9AA7C2] hover:text-[#2575FC] dark:hover:text-[#5B8DFF] rounded-none border-b-2 border-transparent">
                <Shield className="w-4 h-4" />
                <span>Security</span>
              </TabsTrigger>
            </TabsList>
          )}

          <TabsContent value="identity">
            <PageCard>
              <div className="p-6">
                <IdentityTab />
              </div>
            </PageCard>
          </TabsContent>

          <TabsContent value="profile">
            <PageCard>
              <CardHeader>
                <CardTitle className="flex items-center text-base sm:text-lg">
                  <User className="w-5 h-5 mr-2" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Account Name</Label>
                  <Input
                    id="displayName"
                    value={settings.displayName}
                    onChange={(e) => handleSettingChange('displayName', e.target.value)}
                    placeholder="Enter your display name"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <Mail className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <Input
                      id="email"
                      type="email"
                      value={settings.email}
                      disabled
                      className="flex-1 w-full"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed. Contact support if you need to update this.
                  </p>
                </div>
              </CardContent>
            </PageCard>
          </TabsContent>

          <TabsContent value="notifications">
            <PageCard>
              <CardHeader>
                <CardTitle className="flex items-center text-base sm:text-lg">
                  <Bell className="w-5 h-5 mr-2" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-2">
                  <div className="space-y-0.5 flex-1">
                    <Label className="text-sm sm:text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications about new messages and updates
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                    className="self-start sm:self-center"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-2">
                  <div className="space-y-0.5 flex-1">
                    <Label className="text-sm sm:text-base">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about important updates on your device
                    </p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                    className="self-start sm:self-center"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-2">
                  <div className="space-y-0.5 flex-1">
                    <Label className="text-sm sm:text-base">Marketing Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive emails about new features and promotions
                    </p>
                  </div>
                  <Switch
                    checked={settings.marketingEmails}
                    onCheckedChange={(checked) => handleSettingChange('marketingEmails', checked)}
                    className="self-start sm:self-center"
                  />
                </div>
              </CardContent>
            </PageCard>
          </TabsContent>

          <TabsContent value="preferences">
            <PageCard>
              <CardHeader>
                <CardTitle className="flex items-center text-base sm:text-lg">
                  <Globe className="w-5 h-5 mr-2" />
                  Appearance & Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-2">
                  <div className="space-y-0.5 flex-1">
                    <Label className="text-sm sm:text-base">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Switch between light and dark theme
                    </p>
                  </div>
                  <Switch
                    checked={settings.darkMode}
                    onCheckedChange={() => {
                      toggleTheme();
                      handleSettingChange('darkMode', !settings.darkMode);
                    }}
                    className="self-start sm:self-center"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    id="language"
                    className="w-full"
                    value={settings.language}
                    onValueChange={(value) => handleSettingChange('language', value)}
                  >
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    id="timezone"
                    className="w-full"
                    value={settings.timezone}
                    onValueChange={(value) => handleSettingChange('timezone', value)}
                  >
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  </Select>
                </div>
              </CardContent>
            </PageCard>
          </TabsContent>

          <TabsContent value="security">
            <PageCard>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <CardTitle className="flex items-center text-base sm:text-lg">
                    <Shield className="w-5 h-5 mr-2" />
                    Account Security
                  </CardTitle>
                  <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium self-start sm:self-center">
                    Coming Soon
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-border rounded-lg gap-3">
                  <div className="flex items-start sm:items-center space-x-3">
                    <Key className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5 sm:mt-0" />
                    <div>
                      <p className="text-sm font-medium">Password</p>
                      <p className="text-xs text-muted-foreground">Last changed 30 days ago</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full sm:w-auto">
                    Change Password
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-border rounded-lg gap-3">
                  <div className="flex items-start sm:items-center space-x-3">
                    <Smartphone className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5 sm:mt-0" />
                    <div>
                      <p className="text-sm font-medium">Two-Factor Authentication</p>
                      <p className="text-xs text-muted-foreground">Not enabled</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full sm:w-auto">
                    Enable 2FA
                  </Button>
                </div>
              </CardContent>
            </PageCard>
          </TabsContent>
        </Tabs>

      </PageContent>
    </PageFrame>
    </AuthGuard>
  );
}