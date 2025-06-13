import React, { useState, useEffect } from 'react';
import { Shield, Users, Monitor, Activity, Eye, Settings, AlertTriangle } from 'lucide-react';
import { getUsers, getSimulators, User as UserType, Simulator, formatCreditsDisplay } from '../../utils/userStorage';
import Card, { CardHeader, CardContent } from '../ui/Card';
import Button from '../ui/Button';

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [simulators, setSimulators] = useState<Simulator[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'simulators'>('users');

  useEffect(() => {
    setUsers(getUsers());
    setSimulators(getSimulators());
  }, []);

  const getStatusColor = (isOnline: boolean) => {
    return isOnline ? 'text-green-400' : 'text-slate-400';
  };

  const getStatusText = (user: UserType) => {
    if (user.currentSimulator) {
      return `Racing on Sim ${user.currentSimulator}`;
    }
    return user.isOnline ? 'Online' : 'Offline';
  };

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
                variant={activeTab === 'simulators' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('simulators')}
                icon={Monitor}
              >
                Simulator Status
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                <p className="text-red-300 text-sm font-medium">VIP Members</p>
                <p className="text-2xl font-bold text-white">
                  {users.filter(u => u.vipMembership?.active).length}
                </p>
              </div>
              <Shield className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Content */}
      {activeTab === 'users' ? (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-bold text-white">User Management</h3>
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
                        <p className="text-slate-400">Last Active</p>
                        <p className="text-slate-300 text-xs">
                          {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never'}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" icon={Eye}>
                      View Details
                    </Button>
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
    </div>
  );
}