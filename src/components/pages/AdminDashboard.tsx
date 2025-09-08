import React, { useState, useEffect } from 'react';
import { Shield, Users, Monitor, Activity, Eye, Settings, AlertTriangle, Key, UserCheck, UserX, Bell, BellOff, Clock, MapPin, Smartphone, Globe, Flag, MessageCircle, Trash2, EyeOff, CheckCircle, XCircle, Camera, Video } from 'lucide-react';
import { getUsers, getSimulators, User as UserType, Simulator, formatCreditsDisplay, resetUserPassword, updateUser, getAdminNotifications, markNotificationAsRead, getUnreadNotificationCount, getPostReports, PostReport, updatePostReport, getCommunityPosts, hidePost, deleteCommunityPost, getChatMessages } from '../../utils/userStorage';
import { generateSecurePassword } from '../../utils/passwordSecurity';
import Card, { CardHeader, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [simulators, setSimulators] = useState<Simulator[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'simulators' | 'notifications' | 'reports' | 'chat'>('users');
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showScreenMonitoring, setShowScreenMonitoring] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [reports, setReports] = useState<PostReport[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<PostReport | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    setUsers(getUsers());
    setSimulators(getSimulators());
    setNotifications(getAdminNotifications());
    setUnreadCount(getUnreadNotificationCount());
    setReports(getPostReports());
    setChatMessages(getChatMessages());
  }, []);

  const refreshData = () => {
    setUsers(getUsers());
    setNotifications(getAdminNotifications());
    setUnreadCount(getUnreadNotificationCount());
    setReports(getPostReports());
    setChatMessages(getChatMessages());
  };

  const getStatusColor = (isOnline: boolean) => {
    return isOnline ? 'text-green-400' : 'text-slate-400';
  };

  const getStatusText = (user: UserType) => {
    if (user.currentSimulator) {
      return `Racing on Sim ${user.currentSimulator}`;
    }
    return user.isOnline ? 'Online' : 'Offline';
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword.trim()) return;
    
    try {
      const success = await resetUserPassword(selectedUser.email, newPassword);
      if (success) {
        alert(`Password reset successfully for ${selectedUser.fullName}. New password: ${newPassword}`);
        setShowPasswordModal(false);
        setNewPassword('');
        setSelectedUser(null);
        refreshData();
      } else {
        alert('Failed to reset password');
      }
    } catch (error: any) {
      alert(`Failed to reset password: ${error.message}`);
    }
  };

  const toggleAdminStatus = (user: UserType) => {
    const updatedUser = { ...user, isAdmin: !user.isAdmin };
    updateUser(updatedUser);
    setUsers(getUsers()); // Refresh the list
    
    if (updatedUser.isAdmin) {
      alert(`${user.fullName} has been granted admin privileges.`);
    } else {
      alert(`${user.fullName} admin privileges have been revoked.`);
    }
  };

  const generateRandomPassword = () => {
    const password = generateSecurePassword(12);
    setNewPassword(password);
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markNotificationAsRead(notification.id);
      refreshData();
    }
  };

  const handleReportAction = (reportId: string, action: 'dismiss' | 'resolve', adminNotes?: string) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    if (action === 'resolve') {
      // Hide the post
      if (report.postId) {
        hidePost(report.postId, true);
      }
    }

    updatePostReport(reportId, {
      status: action === 'dismiss' ? 'dismissed' : 'resolved',
      adminNotes: adminNotes || `${action === 'dismiss' ? '✅ Dismissed' : '🔒 Resolved'} by admin`
    });

    refreshData();
    setShowReportModal(false);
    setSelectedReport(null);
  };

  const handleDeleteReportedPost = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    if (!report || !report.postId) return;

    if (confirm('Are you sure you want to permanently delete this post?')) {
      const success = deleteCommunityPost(report.postId, 'admin@vipedge.com'); // Admin override
      if (success) {
        updatePostReport(reportId, {
          status: 'resolved',
          adminNotes: '🗑️ Post deleted by admin'
        });
        refreshData();
        setShowReportModal(false);
        setSelectedReport(null);
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_registration':
        return <Users className="w-5 h-5 text-blue-500" />;
      case 'password_reset':
        return <Key className="w-5 h-5 text-yellow-500" />;
      case 'purchase':
        return <Activity className="w-5 h-5 text-green-500" />;
      case 'post_report':
        return <Flag className="w-5 h-5 text-red-500" />;
      case 'chat_message':
        return <MessageCircle className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  const formatNotificationTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return time.toLocaleDateString();
  };

  const getReportStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'reviewed':
        return 'text-blue-400 bg-blue-500/20';
      case 'resolved':
        return 'text-green-400 bg-green-500/20';
      case 'dismissed':
        return 'text-gray-400 bg-gray-500/20';
      default:
        return 'text-slate-400 bg-slate-500/20';
    }
  };

  const pendingReports = reports.filter(r => r.status === 'pending');
  const supportChats = chatMessages.filter(m => m.type === 'support' && !m.isAI);
  const reportChats = chatMessages.filter(m => m.type === 'report' && !m.isAI);

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
            <div className="flex space-x-2">
              <Button
                variant={activeTab === 'users' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('users')}
                icon={Users}
              >
                User Management
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
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingReports.length > 9 ? '9+' : pendingReports.length}
                  </span>
                )}
              </Button>
              <Button
                variant={activeTab === 'chat' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('chat')}
                icon={MessageCircle}
                className="relative"
              >
                Chat Support
                {(supportChats.length + reportChats.length) > 0 && (
                  <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {(supportChats.length + reportChats.length) > 9 ? '9+' : (supportChats.length + reportChats.length)}
                  </span>
                )}
              </Button>
              <Button
                variant={activeTab === 'notifications' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('notifications')}
                icon={Bell}
                className="relative"
              >
                Notifications
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
              <Button
                variant={activeTab === 'simulators' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('simulators')}
                icon={Monitor}
              >
                Simulator Status
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowScreenMonitoring(true)}
                icon={Camera}
              >
                Screen Monitoring
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium">Total Users</p>
                <p className="text-2xl font-bold text-white">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/20 to-green-600/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium">Online Users</p>
                <p className="text-2xl font-bold text-white">{users.filter(u => u.isOnline).length}</p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">Active Simulators</p>
                <p className="text-2xl font-bold text-white">{simulators.filter(s => s.isActive).length}</p>
              </div>
              <Monitor className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/20 to-red-600/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-300 text-sm font-medium">Pending Reports</p>
                <p className="text-2xl font-bold text-white">{pendingReports.length}</p>
              </div>
              <Flag className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-300 text-sm font-medium">VIP Members</p>
                <p className="text-2xl font-bold text-white">
                  {users.filter(u => u.vipMembership?.active).length}
                </p>
              </div>
              <Shield className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Content */}
      {activeTab === 'reports' ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Content Reports</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-400">{pendingReports.length} pending</span>
                <Button variant="ghost" size="sm" onClick={refreshData}>
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Flag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No reports yet.</p>
                </div>
              ) : (
                reports.map((report) => (
                  <div 
                    key={report.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      report.status === 'pending' 
                        ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20' 
                        : 'bg-slate-700/20 border-slate-700/50'
                    }`}
                    onClick={() => {
                      setSelectedReport(report);
                      setShowReportModal(true);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Flag className="w-5 h-5 text-red-500" />
                          <h4 className="font-semibold text-white">
                            Report: {report.reason.replace('_', ' ')}
                          </h4>
                          <span className={`px-2 py-1 rounded text-xs font-bold ${getReportStatusColor(report.status)}`}>
                            {report.status.toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-slate-400">Reported by:</p>
                            <p className="text-white">{report.reporterName}</p>
                          </div>
                          <div>
                            <p className="text-slate-400">Post title:</p>
                            <p className="text-white">{report.post?.title || 'Unknown'}</p>
                          </div>
                          <div>
                            <p className="text-slate-400">Reason:</p>
                            <p className="text-white capitalize">{report.reason.replace('_', ' ')}</p>
                          </div>
                          <div>
                            <p className="text-slate-400">Reported:</p>
                            <p className="text-white">{formatNotificationTime(report.timestamp)}</p>
                          </div>
                        </div>
                        
                        {report.description && (
                          <div className="mt-3">
                            <p className="text-slate-400 text-sm">Description:</p>
                            <p className="text-slate-300 text-sm">{report.description}</p>
                          </div>
                        )}
                        
                        {report.adminNotes && (
                          <div className="mt-3 bg-slate-800/50 rounded p-2">
                            <p className="text-slate-400 text-xs">Admin Notes:</p>
                            <p className="text-slate-300 text-sm">{report.adminNotes}</p>
                          </div>
                        )}
                      </div>
                      
                      {report.status === 'pending' && (
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      ) : activeTab === 'chat' ? (
        <div className="space-y-6">
          {/* Support Chats */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-bold text-white">Support Chats</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {supportChats.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No support chats yet.</p>
                  </div>
                ) : (
                  supportChats.slice(0, 10).map((message) => (
                    <div key={message.id} className="p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <MessageCircle className="w-4 h-4 text-blue-500" />
                            <span className="font-semibold text-white">{message.userName}</span>
                            <span className="text-xs text-slate-500">{formatNotificationTime(message.timestamp)}</span>
                          </div>
                          <p className="text-slate-300 text-sm">{message.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Report Chats */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-bold text-white">Report Chats</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportChats.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Flag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No report chats yet.</p>
                  </div>
                ) : (
                  reportChats.slice(0, 10).map((message) => (
                    <div key={message.id} className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Flag className="w-4 h-4 text-red-500" />
                            <span className="font-semibold text-white">{message.userName}</span>
                            <span className="text-xs text-slate-500">{formatNotificationTime(message.timestamp)}</span>
                          </div>
                          <p className="text-slate-300 text-sm">{message.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : activeTab === 'notifications' ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Admin Notifications</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-400">{unreadCount} unread</span>
                <Button variant="ghost" size="sm" onClick={refreshData}>
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <BellOff className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No notifications yet.</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      notification.read 
                        ? 'bg-slate-700/20 border-slate-700/50' 
                        : 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`font-semibold ${notification.read ? 'text-slate-300' : 'text-white'}`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center space-x-2 text-xs text-slate-500">
                            <Clock className="w-3 h-3" />
                            <span>{formatNotificationTime(notification.timestamp)}</span>
                          </div>
                        </div>
                        <p className={`text-sm mt-1 ${notification.read ? 'text-slate-400' : 'text-slate-300'}`}>
                          {notification.message}
                        </p>
                        {notification.data && (
                          <div className="mt-2 text-xs text-slate-500">
                            {notification.type === 'new_registration' && (
                              <div className="flex items-center space-x-4">
                                <span>📧 {notification.data.email}</span>
                                <span>📱 {notification.data.phone}</span>
                                {notification.data.address && (
                                  <span>📍 {notification.data.state}</span>
                                )}
                              </div>
                            )}
                            {notification.type === 'purchase' && notification.data.package && (
                              <span>💰 ${notification.data.package.price} - {notification.data.package.name}</span>
                            )}
                          </div>
                        )}
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      ) : activeTab === 'users' ? (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-bold text-white">User Management</h3>
            <p className="text-slate-400 text-sm">Manage user accounts, passwords, and admin privileges. All registrations from any device appear here.</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.email} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-600/50">
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
                        <h4 className="font-semibold text-white">{user.fullName}</h4>
                        {user.vipMembership?.active && (
                          <span className="bg-red-500/20 px-2 py-1 rounded text-xs text-red-300">VIP</span>
                        )}
                        {user.isAdmin && (
                          <span className="bg-blue-500/20 px-2 py-1 rounded text-xs text-blue-300">ADMIN</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400">{user.email}</p>
                      <p className={`text-xs ${getStatusColor(user.isOnline || false)}`}>
                        {getStatusText(user)}
                      </p>
                      <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Registered: {new Date(user.registrationDate).toLocaleDateString()}</span>
                        </div>
                        {user.address && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{user.state}</span>
                          </div>
                        )}
                        {user.deviceInfo && (
                          <div className="flex items-center space-x-1">
                            <Smartphone className="w-3 h-3" />
                            <span>{user.deviceInfo.split(' ')[0]}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right space-y-1">
                    <div className="flex items-center space-x-4 text-sm">
                      <div>
                        <p className="text-slate-400">Credits</p>
                        <p className="text-green-400 font-semibold">{formatCreditsDisplay(user.racingCredits || 0)}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Balance</p>
                        <p className="text-blue-400 font-semibold">${(user.accountBalance || 0).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Password</p>
                        <p className="text-yellow-400 font-mono text-xs bg-slate-800/50 px-2 py-1 rounded">
                          ••••••••
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        icon={Eye}
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserDetails(true);
                        }}
                      >
                        Details
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        icon={Key}
                        onClick={() => {
                          setSelectedUser(user);
                          setShowPasswordModal(true);
                        }}
                      >
                        Reset Password
                      </Button>
                      <Button 
                        variant={user.isAdmin ? "ghost" : "outline"} 
                        size="sm" 
                        icon={user.isAdmin ? UserX : UserCheck}
                        onClick={() => toggleAdminStatus(user)}
                      >
                        {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Simulator Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {simulators.map((simulator) => (
              <Card key={simulator.id} className={`${simulator.isActive ? 'border-green-500/30' : 'border-red-500/30'}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white">{simulator.name}</h3>
                    <div className={`w-3 h-3 rounded-full ${simulator.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                  </div>
                  
                  {simulator.currentUser ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-600/50">
                          {simulator.currentUser.profilePicture ? (
                            <img src={simulator.currentUser.profilePicture} alt="User" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-slate-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{simulator.currentUser.fullName}</p>
                          <p className="text-xs text-slate-400">{simulator.currentGame || 'Racing'}</p>
                        </div>
                      </div>
                      
                      {simulator.currentUser.isStreaming && (
                        <div className="bg-red-500/20 px-2 py-1 rounded text-xs text-red-300 text-center">
                          🔴 STREAMING LIVE
                        </div>
                      )}
                      
                      {/* Screen Previews */}
                      <div className="grid grid-cols-3 gap-1">
                        {simulator.screens?.map((screen, index) => (
                          <div key={index} className="aspect-video bg-slate-700 rounded overflow-hidden">
                            <img src={screen} alt={`Screen ${index + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Monitor className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">
                        {simulator.isActive ? 'Available' : 'Offline'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Simulator Controls */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-bold text-white">Simulator Controls</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" icon={Settings}>
                  Configure All
                </Button>
                <Button variant="outline" icon={Monitor}>
                  Restart Systems
                </Button>
                <Button variant="outline" icon={AlertTriangle}>
                  Emergency Stop
                </Button>
                <Button variant="outline" icon={Activity}>
                  System Health
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Details Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => {
          setShowReportModal(false);
          setSelectedReport(null);
        }}
        title="Report Details"
      >
        {selectedReport && (
          <div className="space-y-6">
            {/* Report Info */}
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Reported by:</p>
                  <p className="text-white font-semibold">{selectedReport.reporterName}</p>
                </div>
                <div>
                  <p className="text-slate-400">Report time:</p>
                  <p className="text-white">{new Date(selectedReport.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-400">Reason:</p>
                  <p className="text-white capitalize">{selectedReport.reason.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-slate-400">Status:</p>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${getReportStatusColor(selectedReport.status)}`}>
                    {selectedReport.status.toUpperCase()}
                  </span>
                </div>
              </div>
              
              {selectedReport.description && (
                <div className="mt-4">
                  <p className="text-slate-400 text-sm">Description:</p>
                  <p className="text-white">{selectedReport.description}</p>
                </div>
              )}
            </div>

            {/* Post Content */}
            {selectedReport.post && (
              <div className="bg-slate-700/30 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-3">Reported Post</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-slate-400 text-sm">Title:</p>
                    <p className="text-white">{selectedReport.post.title}</p>
                  </div>
                  {selectedReport.post.description && (
                    <div>
                      <p className="text-slate-400 text-sm">Description:</p>
                      <p className="text-white">{selectedReport.post.description}</p>
                    </div>
                  )}
                  {selectedReport.post.mediaUrl && (
                    <div>
                      <p className="text-slate-400 text-sm">Media:</p>
                      <img 
                        src={selectedReport.post.mediaUrl} 
                        alt="Reported content" 
                        className="w-full max-w-sm h-auto rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Admin Actions */}
            {selectedReport.status === 'pending' && (
              <div className="space-y-4">
                <h4 className="font-semibold text-white">Admin Actions</h4>
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleReportAction(selectedReport.id, 'dismiss', 'Report reviewed - no violation found')}
                    icon={XCircle}
                    className="w-full justify-start"
                  >
                    Dismiss Report (No Violation)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleReportAction(selectedReport.id, 'resolve', 'Post hidden due to policy violation')}
                    icon={EyeOff}
                    className="w-full justify-start bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/30"
                  >
                    Hide Post (Policy Violation)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDeleteReportedPost(selectedReport.id)}
                    icon={Trash2}
                    className="w-full justify-start bg-red-500/10 hover:bg-red-500/20 border-red-500/30"
                  >
                    Delete Post (Severe Violation)
                  </Button>
                </div>
              </div>
            )}

            {/* Admin Notes */}
            {selectedReport.adminNotes && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-blue-300 text-sm font-semibold">Admin Notes:</p>
                <p className="text-blue-200 text-sm mt-1">{selectedReport.adminNotes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Screen Monitoring Modal */}
      <Modal
        isOpen={showScreenMonitoring}
        onClose={() => setShowScreenMonitoring(false)}
        title="Racing Simulator Screen Monitoring"
      >
        <div className="space-y-6">
          <div className="text-center">
            <Monitor className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Live Screen Monitoring</h3>
            <p className="text-slate-400">
              Monitor all 8 racing simulators in real-time. This feature will be integrated with 
              screen monitoring software once the physical units are installed.
            </p>
          </div>

          {/* Simulator Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="bg-slate-700/30 rounded-lg p-4 text-center">
                <div className="w-full h-24 bg-slate-800/50 rounded-lg mb-3 flex items-center justify-center">
                  <div className="text-center">
                    <Video className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">Simulator {i + 1}</p>
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-xs text-slate-400">Offline</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <h4 className="font-semibold text-blue-300 mb-2">Integration Status</h4>
            <ul className="text-blue-200 text-sm space-y-1">
              <li>• 🔧 Hardware installation pending</li>
              <li>• 📹 Screen capture software integration ready</li>
              <li>• 🖥️ Real-time monitoring dashboard prepared</li>
              <li>• 📊 Performance metrics tracking available</li>
              <li>• 🔒 Secure admin-only access configured</li>
            </ul>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-300 mb-2">Coming Soon Features</h4>
            <ul className="text-yellow-200 text-sm space-y-1">
              <li>• Live video feeds from each simulator</li>
              <li>• User activity monitoring</li>
              <li>• Performance analytics</li>
              <li>• Remote assistance capabilities</li>
              <li>• Session recording and playback</li>
            </ul>
          </div>
        </div>
      </Modal>

      {/* Password Reset Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setNewPassword('');
          setSelectedUser(null);
        }}
        title="Reset User Password"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="bg-slate-700/30 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">User: {selectedUser.fullName}</h4>
              <p className="text-slate-400 text-sm">Email: {selectedUser.email}</p>
              <p className="text-slate-400 text-sm">Current Password: <span className="font-mono text-yellow-400">••••••••</span></p>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">New Password</label>
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" onClick={generateRandomPassword}>
                  Generate Secure
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                Generated passwords meet all security requirements (8+ chars, uppercase, lowercase, number, special character)
              </p>
            </div>
            
            <div className="flex space-x-3">
              <Button onClick={handleResetPassword} disabled={!newPassword.trim()}>
                Reset Password
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowPasswordModal(false);
                  setNewPassword('');
                  setSelectedUser(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* User Details Modal */}
      <Modal
        isOpen={showUserDetails}
        onClose={() => {
          setShowUserDetails(false);
          setSelectedUser(null);
        }}
        title="User Details"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300">Full Name</label>
                <p className="text-white">{selectedUser.fullName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Email</label>
                <p className="text-white">{selectedUser.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Phone</label>
                <p className="text-white">{selectedUser.phone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Date of Birth</label>
                <p className="text-white">{new Date(selectedUser.dob).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Address</label>
                <p className="text-white">
                  {selectedUser.address ? `${selectedUser.address}, ${selectedUser.state} ${selectedUser.zipCode}` : 'Not provided'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Emergency Contact</label>
                <p className="text-white">{selectedUser.emergencyName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Emergency Phone</label>
                <p className="text-white">{selectedUser.emergencyPhone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Registration Date</label>
                <p className="text-white">{new Date(selectedUser.registrationDate).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Registration Source</label>
                <p className="text-white text-xs">{selectedUser.registrationSource || 'Unknown'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Device Info</label>
                <p className="text-white text-xs">{selectedUser.deviceInfo || 'Unknown'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">IP Address</label>
                <p className="text-white text-xs">{selectedUser.ipAddress || 'Unknown'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Account Status</label>
                <div className="flex space-x-2">
                  {selectedUser.isAdmin && (
                    <span className="bg-blue-500/20 px-2 py-1 rounded text-xs text-blue-300">ADMIN</span>
                  )}
                  {selectedUser.vipMembership?.active && (
                    <span className="bg-red-500/20 px-2 py-1 rounded text-xs text-red-300">VIP</span>
                  )}
                  {selectedUser.isOnline && (
                    <span className="bg-green-500/20 px-2 py-1 rounded text-xs text-green-300">ONLINE</span>
                  )}
                </div>
              </div>
            </div>
            
            {selectedUser.bio && (
              <div>
                <label className="block text-sm font-medium text-slate-300">Bio</label>
                <p className="text-white">{selectedUser.bio}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}