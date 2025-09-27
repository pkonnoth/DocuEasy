"use client";

import { useState, useEffect } from 'react';
import { Search, Filter, Eye, Download, Calendar, User, Activity } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

import { createClient } from '@/lib/supabase/client';

export default function AuditLogViewer({ user, profile }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [filters, setFilters] = useState({
    action: '',
    actor_role: '',
    result_status: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  const isAdmin = profile?.role === 'admin';

  // Fetch audit logs
  const fetchAuditLogs = async () => {
    setLoading(true);
    
    try {
      const supabase = createClient();
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('requested_at', { ascending: false })
        .limit(100);

      // Apply filters
      if (filters.action) {
        query = query.eq('action', filters.action);
      }
      if (filters.actor_role) {
        query = query.eq('actor_role', filters.actor_role);
      }
      if (filters.result_status) {
        query = query.eq('result_status', filters.result_status);
      }
      if (filters.dateFrom) {
        query = query.gte('requested_at', new Date(filters.dateFrom).toISOString());
      }
      if (filters.dateTo) {
        query = query.lte('requested_at', new Date(filters.dateTo).toISOString());
      }
      if (filters.search) {
        query = query.or(`actor_email.ilike.%${filters.search}%,action.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        setError(error.message);
        return;
      }

      setLogs(data || []);
      
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  // Load logs on component mount and filter changes
  useEffect(() => {
    if (isAdmin) {
      fetchAuditLogs();
    }
  }, [filters, isAdmin]);

  // Update filter
  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      action: '',
      actor_role: '',
      result_status: '',
      dateFrom: '',
      dateTo: '',
      search: ''
    });
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  // Get status badge variant
  const getStatusVariant = (status) => {
    switch (status) {
      case 'success':
        return 'default';
      case 'failure':
        return 'destructive';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Get action display name
  const getActionDisplay = (action) => {
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Only admins can view audit logs
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card>
          <CardContent className="p-6 text-center">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Access Denied</p>
            <p className="text-muted-foreground">Only administrators can view audit logs.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--medical-blue)] flex items-center">
          <Activity className="h-8 w-8 mr-2" />
          Audit Log Viewer
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor system activities and user actions for compliance and security.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Email or action..."
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="action">Action</Label>
              <Select value={filters.action} onValueChange={(value) => updateFilter('action', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All actions</SelectItem>
                  <SelectItem value="create_patient">Create Patient</SelectItem>
                  <SelectItem value="view_patient">View Patient</SelectItem>
                  <SelectItem value="user_login">User Login</SelectItem>
                  <SelectItem value="user_logout">User Logout</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="role">User Role</Label>
              <Select value={filters.actor_role} onValueChange={(value) => updateFilter('actor_role', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="clinician">Clinician</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={filters.result_status} onValueChange={(value) => updateFilter('result_status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failure">Failure</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => updateFilter('dateFrom', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => updateFilter('dateTo', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
            <div className="text-sm text-muted-foreground">
              Showing {logs.length} results
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Audit Logs</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading audit logs...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-red-500">Error: {error}</div>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">No audit logs found</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {formatTimestamp(log.requested_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{log.actor_email || 'System'}</span>
                          {log.actor_role && (
                            <Badge variant="outline" className="w-fit mt-1">
                              {log.actor_role}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Activity className="h-4 w-4 mr-2 text-muted-foreground" />
                          {getActionDisplay(log.action)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.scope_patient_id ? (
                          <Badge variant="secondary">
                            {log.scope_patient_id}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(log.result_status)}>
                          {log.result_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.duration_ms ? `${log.duration_ms}ms` : '-'}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}