import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Flag, 
  Bell, 
  Trash2, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Clock,
  Monitor,
  Activity,
  BarChart3,
  FileText,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { 
  getUsers, 
  getAdminNotifications, 
  markNotificationAsRead,
  getPostReports,
  updatePostReport,
  hidePost,
  deleteCommunityPost,
  getCommunityPosts,
  User as UserType,
  PostReport
} from '../../utils/userStorage';
import { 
  getPostAuditLogs, 
  getFlaggedPosts, 
  resolveFlaggedPost,
  PostAuditLog 
} from '../../utils/postManagement';
import Card, { CardHeader, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'posts' | 'reports' | 'audit' | 'notifications'>('overview');
  const [users, setUsers] = useState<UserType[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [postReports, setPostReports] = useState<PostReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<PostAuditLog[]>([]);
  const [flaggedPosts, setFlaggedPosts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'resolved'>('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = () => {
    setUsers(getUsers());
    setNotifications(getAdminNotifications());
    setPostReports(getPostReports());
    setAuditLogs(getPostAuditLogs());
    setFlaggedPosts(getFlaggedPosts());
  };

  const handleMarkNotificationRead = (notificationId: string) => {
    markNotificationAsRead(notificationId);
    loadAdminData();
  };

  const handleResolveReport = (reportId: string, action: 'dismiss' | 'hide' | 'delete', notes?: string) => {
    const report = postReports.find(r => r.id === reportId);
    if (!report) return;

    if (action === 'hide') {
      hidePost(report.postId, true);
    } else if (action === 'delete') {
      deleteCommunityPost(report.postId, 'admin@vipsimracing.com');
    }

    updatePostReport(reportId, {
      status: action === 'dismiss' ? 'dismissed' : 'resolved',
      adminNotes: notes
    });

    loadAdminData();
  };

  const handleResolveFlaggedPost = (flagId: string, action: 'approved' | 'deleted' | 'hidden', notes?: string) => {
    resolveFlaggedPost(flagId, 'admin@vipsimracing.com', action, notes);
    loadAdminData();
  };

  const exportAuditLogs = () => {
    const csvContent = [
      ['Timestamp', 'Post ID', 'Action', 'Performed By', 'Reason'].join(','),
      ...auditLogs.map(log => [
        log.timestamp,
        log.postId,
        log.action,
        log.performerName,
        log.reason || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredReports = postReports.filter(report => {
    const matchesSearch = searchTerm === '' || 
      report.reporterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || report.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const filteredUsers = users.filter(user => 
    searchTerm === '' || 
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadNotifications = notifications.filter(n => !n.read);
  const pendingReports = postReports.filter(r => r.status === 'pending');
  const pendingFlags = flaggedPosts.filter(f => f.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-bold text-white">Admin Dashboard</h2>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={loadAdminData} icon={RefreshCw}>
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={exportAuditLogs} icon={Download}>
                Export Logs
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10">
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{users.length}</p>
            <p className="text-sm text-blue-300">Total Users</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/20 to-red-600/10">
          <CardContent className="p-4 text-center">
            <Flag className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{pendingReports.length}</p>
            <p className="text-sm text-red-300">Pending Reports</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10">
          <CardContent className="p-4 text-center">
            <Bell className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{unreadNotifications.length}</p>
            <p className="text-sm text-yellow-300">Unread Alerts</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10">
          <CardContent className="p-4 text-center">
            <Activity className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{auditLogs.length}</p>
            <p className="text-sm text-purple-300">Audit Entries</p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 bg-slate-800/50 p-2 rounded-lg">
        <Button
          variant={activeTab === 'overview' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('overview')}
          icon={BarChart3}
        >
          Overview
        </Button>
        <Button
          variant={activeTab === 'users' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('users')}
          icon={Users}
        >
          Users ({users.length})
        </Button>
        <Button
          variant={activeTab === 'posts' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('posts')}
          icon={FileText}
        >
          Posts
        </Button>
        <Button
          variant={activeTab === 'reports' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('reports')}
          icon={Flag}
          className="relative"
        >
          Reports
          {pendingReports.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {pendingReports.length}
            </span>
          )}
        </Button>
        <Button
          variant={activeTab === 'audit' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('audit')}
          icon={FileText}
        >
          Audit Log
        </Button>
        <Button
          variant={activeTab === 'notifications' ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('notifications')}
          icon={Bell}
          className="relative"
        >
          Notifications
          {unreadNotifications.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {unreadNotifications.length}
            </span>
          )}
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* System Health */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-bold text-white">System Health</h3>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">System Status</h4>
                  <p className="text-green-400 font-bold">All Systems Operational</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Monitor className="w-8 h-8 text-blue-500" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">Active Sessions</h4>
                  <p className="text-blue-400 font-bold">0 Racing</p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Activity className="w-8 h-8 text-purple-500" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">Performance</h4>
                  <p className="text-purple-400 font-bold">Optimal</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-bold text-white">Recent Activity</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-slate-600/50 rounded-full flex items-center justify-center">
                        <FileText className="w-4 h-4 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{log.action} by {log.performerName}</p>
                        <p className="text-sm text-slate-400">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500">Post #{log.postId.slice(-6)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={Search}
                  />
                </div>
                <Button variant="outline" icon={Filter}>
                  Filter
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-bold text-white">User Management</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredUsers.map((user) => (
                  <div key={user.email} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-600">
                        {user.profilePicture ? (
                          <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold text-white">{user.fullName}</p>
                          {user.isAdmin && (
                            <span className="bg-red-500/20 px-2 py-1 rounded text-xs text-red-300 font-bold">
                              ADMIN
                            </span>
                          )}
                          {user.vipMembership?.active && (
                            <span className="bg-purple-500/20 px-2 py-1 rounded text-xs text-purple-300 font-bold">
                              VIP
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-400">{user.email}</p>
                        <p className="text-xs text-slate-500">
                          Registered: {new Date(user.registrationDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="text-center">
                          <p className="text-slate-400">Credits</p>
                          <p className="font-semibold text-green-400">{user.racingCredits || 0}m</p>
                        </div>
                        <div className="text-center">
                          <p className="text-slate-400">Balance</p>
                          <p className="font-semibold text-blue-400">${(user.accountBalance || 0).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All Reports</option>
                  <option value="pending">Pending</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Reports List */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-bold text-white">Content Reports</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredReports.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Flag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No reports found.</p>
                  </div>
                ) : (
                  filteredReports.map((report) => (
                    <div key={report.id} className="p-4 bg-slate-700/30 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            report.status === 'pending' ? 'bg-yellow-500' :
                            report.status === 'resolved' ? 'bg-green-500' :
                            'bg-gray-500'
                          }`} />
                          <div>
                            <p className="font-semibold text-white">
                              {report.reason.charAt(0).toUpperCase() + report.reason.slice(1)} Report
                            </p>
                            <p className="text-sm text-slate-400">
                              By {report.reporterName} • {new Date(report.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          report.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                          report.status === 'resolved' ? 'bg-green-500/20 text-green-300' :
                          'bg-gray-500/20 text-gray-300'
                        }`}>
                          {report.status.toUpperCase()}
                        </span>
                      </div>
                      
                      <p className="text-slate-300 text-sm">{report.description}</p>
                      
                      {report.post && (
                        <div className="bg-slate-800/50 rounded-lg p-3">
                          <p className="font-medium text-white">{report.post.title}</p>
                          <p className="text-sm text-slate-400">{report.post.description}</p>
                        </div>
                      )}
                      
                      {report.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResolveReport(report.id, 'dismiss', 'No violation found')}
                            icon={CheckCircle}
                          >
                            Dismiss
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResolveReport(report.id, 'hide', 'Content hidden for review')}
                            icon={EyeOff}
                          >
                            Hide Post
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResolveReport(report.id, 'delete', 'Content removed for policy violation')}
                            icon={Trash2}
                            className="text-red-400 hover:text-red-300"
                          >
                            Delete Post
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'audit' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Audit Log</h3>
              <Button variant="outline" size="sm" onClick={exportAuditLogs} icon={Download}>
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {auditLogs.slice(0, 20).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      log.action === 'created' ? 'bg-green-500/20' :
                      log.action === 'edited' ? 'bg-blue-500/20' :
                      log.action === 'deleted' ? 'bg-red-500/20' :
                      'bg-yellow-500/20'
                    }`}>
                      <FileText className={`w-4 h-4 ${
                        log.action === 'created' ? 'text-green-500' :
                        log.action === 'edited' ? 'text-blue-500' :
                        log.action === 'deleted' ? 'text-red-500' :
                        'text-yellow-500'
                      }`} />
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {log.performerName} {log.action} post #{log.postId.slice(-6)}
                      </p>
                      <p className="text-sm text-slate-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                      {log.reason && (
                        <p className="text-xs text-slate-500">Reason: {log.reason}</p>
                      )}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    log.action === 'created' ? 'bg-green-500/20 text-green-300' :
                    log.action === 'edited' ? 'bg-blue-500/20 text-blue-300' :
                    log.action === 'deleted' ? 'bg-red-500/20 text-red-300' :
                    'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    {log.action.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'notifications' && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-bold text-white">Admin Notifications</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No notifications.</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 rounded-lg border ${
                      notification.read 
                        ? 'bg-slate-700/20 border-slate-700/50' 
                        : 'bg-blue-500/10 border-blue-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Bell className={`w-4 h-4 ${notification.read ? 'text-slate-400' : 'text-blue-400'}`} />
                          <h4 className={`font-semibold ${notification.read ? 'text-slate-300' : 'text-white'}`}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className={`text-sm ${notification.read ? 'text-slate-500' : 'text-slate-300'}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-500 mt-2">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkNotificationRead(notification.id)}
                          icon={CheckCircle}
                        >
                          Mark Read
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}