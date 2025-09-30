'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/firebase-auth';
import { useRouter } from 'next/navigation';
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
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('identity');
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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/signup');
      return;
    }

    if (user) {
      setSettings(prev => ({
        ...prev,
        displayName: user.displayName || '',
        email: user.email || ''
      }));
    }
  }, [user, loading, router]);

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
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/forum" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Link>
              <div className="flex items-center space-x-2">
                <SettingsIcon className="w-6 h-6 text-gray-600" />
                <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
              </div>
            </div>
            {activeTab !== 'identity' && (
              <div className="flex items-center space-x-3">
                {saved && (
                  <span className="text-green-600 text-sm font-medium">Saved!</span>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('identity')}
                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'identity'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <User className="w-4 h-4 inline mr-2" />
                Identity
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Mail className="w-4 h-4 inline mr-2" />
                Profile
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'notifications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Bell className="w-4 h-4 inline mr-2" />
                Notifications
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'preferences'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Globe className="w-4 h-4 inline mr-2" />
                Preferences
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'security'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Shield className="w-4 h-4 inline mr-2" />
                Security
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {activeTab === 'identity' && <IdentityTab />}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Profile Information
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Name
                    </label>
                    <input
                      type="text"
                      value={settings.displayName}
                      onChange={(e) => handleSettingChange('displayName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your display name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={settings.email}
                        disabled
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Email cannot be changed. Contact support if you need to update this.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Notification Preferences
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                      <p className="text-xs text-gray-500">Receive notifications about new messages and updates</p>
                    </div>
                    <button
                      onClick={() => handleSettingChange('emailNotifications', !settings.emailNotifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Push Notifications</label>
                      <p className="text-xs text-gray-500">Get notified about important updates on your device</p>
                    </div>
                    <button
                      onClick={() => handleSettingChange('pushNotifications', !settings.pushNotifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.pushNotifications ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Marketing Emails</label>
                      <p className="text-xs text-gray-500">Receive emails about new features and promotions</p>
                    </div>
                    <button
                      onClick={() => handleSettingChange('marketingEmails', !settings.marketingEmails)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.marketingEmails ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          settings.marketingEmails ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Appearance & Preferences
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Dark Mode</label>
                      <p className="text-xs text-gray-500">Switch between light and dark theme</p>
                    </div>
                    <button
                      onClick={() => handleSettingChange('darkMode', !settings.darkMode)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.darkMode ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                          settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <select
                      value={settings.language}
                      onChange={(e) => handleSettingChange('language', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select
                      value={settings.timezone}
                      onChange={(e) => handleSettingChange('timezone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Account Security
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Key className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Password</p>
                        <p className="text-xs text-gray-500">Last changed 30 days ago</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                      Change Password
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Two-Factor Authentication</p>
                        <p className="text-xs text-gray-500">Not enabled</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                      Enable 2FA
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Links */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Links</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/forum"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                  <div className="w-5 h-5 bg-blue-600 rounded"></div>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Community Forum</p>
                  <p className="text-sm text-gray-500">Join discussions and connect</p>
                </div>
              </Link>

              <Link
                href="/organizations"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mr-3">
                  <div className="w-5 h-5 bg-green-600 rounded"></div>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Browse Organizations</p>
                  <p className="text-sm text-gray-500">Explore companies and contacts</p>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}