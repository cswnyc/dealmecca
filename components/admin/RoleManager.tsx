'use client';

import React, { useState, useEffect } from 'react';
import { UserRole, getRoleDefinition, permissionSystem } from '@/lib/permissions';
import { featureGates } from '@/lib/feature-gates';
import { authedFetch } from '@/lib/authedFetch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Shield, 
  Crown, 
  Building, 
  Star, 
  Settings,
  Edit,
  UserPlus,
  Search,
  Download,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  teamId?: string;
  teamName?: string;
}

interface TeamInfo {
  id: string;
  name: string;
  memberCount: number;
  ownerEmail: string;
}

const RoleIcons: Record<UserRole, React.ComponentType<any>> = {
  FREE: Users,
  PRO: Star,
  TEAM: Building,
  ENTERPRISE: Crown,
  ADMIN: Shield,
  SUPER_ADMIN: Settings
};

const RoleColors: Record<UserRole, string> = {
  FREE: 'bg-muted text-muted-foreground',
  PRO: 'bg-primary/20 text-primary',
  TEAM: 'bg-green-100 text-green-800',
  ENTERPRISE: 'bg-purple-100 text-purple-800',
  ADMIN: 'bg-orange-100 text-orange-800',
  SUPER_ADMIN: 'bg-destructive/20 text-destructive'
};

export default function RoleManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<TeamInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load users and teams
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [usersResponse, teamsResponse] = await Promise.all([
        authedFetch('/api/admin/users'),
        authedFetch('/api/admin/teams')
      ]);

      if (!usersResponse.ok) throw new Error('Failed to load users');
      if (!teamsResponse.ok) throw new Error('Failed to load teams');

      const usersData = await usersResponse.json();
      const teamsData = await teamsResponse.json();

      setUsers(usersData.users || []);
      setTeams(teamsData.teams || []);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  // Handle role change
  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      setError(null);
      const response = await authedFetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update role');
      }

      setSuccess(`Successfully updated user role to ${newRole}`);
      loadData();
      setTimeout(() => setSuccess(null), 5000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update role');
    }
  };

  // Handle user activation/deactivation
  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      setError(null);
      const response = await authedFetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user status');
      }

      setSuccess(`Successfully ${isActive ? 'activated' : 'deactivated'} user`);
      loadData();
      setTimeout(() => setSuccess(null), 5000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update user status');
    }
  };

  // Handle bulk actions
  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.size === 0) return;

    try {
      setError(null);
      const response = await authedFetch('/api/admin/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: bulkAction,
          userIds: Array.from(selectedUsers)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Bulk action failed');
      }

      setSuccess(`Bulk action ${bulkAction} completed successfully`);
      setSelectedUsers(new Set());
      setBulkAction('');
      loadData();
      setTimeout(() => setSuccess(null), 5000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Bulk action failed');
    }
  };

  // Export users
  const handleExport = async () => {
    try {
      const response = await authedFetch('/api/admin/users/export');
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setError('Failed to export users');
    }
  };

  const getRoleIcon = (role: UserRole) => {
    const Icon = RoleIcons[role];
    return <Icon className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
          <p className="text-muted-foreground">
            Manage user roles, permissions, and access levels
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Users
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              {users.filter(u => u.isActive).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teams</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams.length}</div>
            <p className="text-xs text-muted-foreground">
              {teams.reduce((acc, team) => acc + team.memberCount, 0)} members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Users</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role !== 'FREE').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((users.filter(u => u.role !== 'FREE').length / users.length) * 100)}% conversion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enterprise</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'ENTERPRISE').length}
            </div>
            <p className="text-xs text-muted-foreground">
              High-value customers
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Search, filter, and manage user accounts and roles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search Users</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by email or name..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="sm:w-48">
                  <Label htmlFor="role-filter">Filter by Role</Label>
                  <Select
                    value={selectedRole}
                    onValueChange={(value) => setSelectedRole(value as UserRole | 'all')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="FREE">Free</SelectItem>
                      <SelectItem value="PRO">Pro</SelectItem>
                      <SelectItem value="TEAM">Team</SelectItem>
                      <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedUsers.size > 0 && (
                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <span className="text-sm font-medium">
                    {selectedUsers.size} users selected
                  </span>
                  <Select value={bulkAction} onValueChange={setBulkAction}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Choose action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activate">Activate</SelectItem>
                      <SelectItem value="deactivate">Deactivate</SelectItem>
                      <SelectItem value="upgrade_to_pro">Upgrade to Pro</SelectItem>
                      <SelectItem value="reset_usage">Reset Usage</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleBulkAction}
                    disabled={!bulkAction}
                    size="sm"
                  >
                    Apply Action
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableCaption>
                  {filteredUsers.length} of {users.length} users
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedUsers.size === filteredUsers.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
                          } else {
                            setSelectedUsers(new Set());
                          }
                        }}
                      />
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user.id)}
                          onChange={(e) => {
                            const newSelected = new Set(selectedUsers);
                            if (e.target.checked) {
                              newSelected.add(user.id);
                            } else {
                              newSelected.delete(user.id);
                            }
                            setSelectedUsers(newSelected);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.name || 'Unknown'}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={RoleColors[user.role]}>
                          <div className="flex items-center gap-1">
                            {getRoleIcon(user.role)}
                            {user.role}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.teamName || (user.teamId ? 'Team Member' : 'Individual')}
                      </TableCell>
                      <TableCell>
                        {user.lastLoginAt 
                          ? new Date(user.lastLoginAt).toLocaleDateString()
                          : 'Never'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingUser(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit User: {user.email}</DialogTitle>
                                <DialogDescription>
                                  Update user role and status
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="user-role">Role</Label>
                                  <Select
                                    defaultValue={user.role}
                                    onValueChange={(value) => handleRoleChange(user.id, value as UserRole)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="FREE">Free</SelectItem>
                                      <SelectItem value="PRO">Pro</SelectItem>
                                      <SelectItem value="TEAM">Team</SelectItem>
                                      <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                                      <SelectItem value="ADMIN">Admin</SelectItem>
                                      <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant={user.isActive ? "destructive" : "default"}
                                    onClick={() => handleToggleActive(user.id, !user.isActive)}
                                    size="sm"
                                  >
                                    {user.isActive ? 'Deactivate' : 'Activate'}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Role Definitions & Permissions</CardTitle>
              <CardDescription>
                View detailed permissions and limits for each role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(['FREE', 'PRO', 'TEAM', 'ENTERPRISE', 'ADMIN', 'SUPER_ADMIN'] as UserRole[]).map(role => {
                  const definition = getRoleDefinition(role);
                  if (!definition) return null;

                  const Icon = RoleIcons[role];
                  
                  return (
                    <Card key={role} className="h-full">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Icon className="h-5 w-5" />
                          {definition.name}
                        </CardTitle>
                        <CardDescription>{definition.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Usage Limits</h4>
                          <ul className="text-sm space-y-1">
                            <li>Searches: {definition.limits.searchesPerMonth === -1 ? 'Unlimited' : definition.limits.searchesPerMonth}/month</li>
                            <li>Saved Searches: {definition.limits.savedSearches === -1 ? 'Unlimited' : definition.limits.savedSearches}</li>
                            <li>Exports: {definition.limits.exportRecordsPerMonth === -1 ? 'Unlimited' : definition.limits.exportRecordsPerMonth}/month</li>
                            <li>Team Members: {definition.limits.teamMembers === -1 ? 'Unlimited' : definition.limits.teamMembers}</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Key Permissions</h4>
                          <div className="flex flex-wrap gap-1">
                            {definition.permissions.slice(0, 6).map(permission => (
                              <Badge key={permission} variant="outline" className="text-xs">
                                {permission.replace(/[_:]/g, ' ')}
                              </Badge>
                            ))}
                            {definition.permissions.length > 6 && (
                              <Badge variant="outline" className="text-xs">
                                +{definition.permissions.length - 6} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Management</CardTitle>
              <CardDescription>
                Overview of teams and their members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>
                  {teams.length} teams
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team Name</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teams.map((team) => (
                    <TableRow key={team.id}>
                      <TableCell className="font-medium">{team.name}</TableCell>
                      <TableCell>{team.ownerEmail}</TableCell>
                      <TableCell>{team.memberCount}</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}