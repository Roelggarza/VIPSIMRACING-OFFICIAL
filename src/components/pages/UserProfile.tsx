import React from 'react';
import { User, Crown, Trophy, Clock, Target, Calendar, MapPin, Edit } from 'lucide-react';
import { User as UserType, formatCreditsDisplay } from '../../utils/userStorage';
import Card, { CardHeader, CardContent } from '../ui/Card';
import Button from '../ui/Button';

interface UserProfileProps {
  user: UserType;
  onClose: () => void;
}

export default function UserProfile({ user, onClose }: UserProfileProps) {
  const isVipActive = user.vipMembership?.active && new Date(user.vipMembership.expiryDate) > new Date();
  const memberSince = user.registrationDate 
    ? new Date(user.registrationDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      })
    : 'Recently';

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="relative">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-slate-700 via-slate-600 to-red-900/50 rounded-lg overflow-hidden">
          {user.bannerImage ? (
            <img 
              src={user.bannerImage} 
              alt="Banner" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-slate-700 via-slate-600 to-red-900/50" />
          )}
        </div>
        
        {/* Profile Picture */}
        <div className="absolute -bottom-12 left-6">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-700 border-4 border-slate-800">
            {user.profilePicture ? (
              <img 
                src={user.profilePicture} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-12 h-12 text-slate-400" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="pt-12 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-white">{user.fullName}</h1>
              {isVipActive && (
                <div className="bg-red-500/20 px-3 py-1 rounded-full border border-red-500/30">
                  <span className="text-red-300 text-sm font-bold flex items-center">
                    <Crown className="w-4 h-4 mr-1" />
                    VIP MEMBER
                  </span>
                </div>
              )}
              {user.isOnline && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-400 text-sm">Online</span>
                </div>
              )}
            </div>
            
            <p className="text-slate-300 mb-2">
              {user.bio || 'Racing enthusiast passionate about speed and precision.'}
            </p>
            
            <div className="flex items-center space-x-4 text-sm text-slate-400">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Member since {memberSince}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Trophy className="w-4 h-4" />
                <span>Rank #{user.stats?.rank || '--'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10">
            <CardContent className="p-4 text-center">
              <Target className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{user.stats?.totalRaces || 0}</p>
              <p className="text-sm text-blue-300">Total Races</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-green-600/10">
            <CardContent className="p-4 text-center">
              <Trophy className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{user.stats?.wins || 0}</p>
              <p className="text-sm text-green-300">Wins</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10">
            <CardContent className="p-4 text-center">
              <Crown className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{user.stats?.podiums || 0}</p>
              <p className="text-sm text-purple-300">Podiums</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/10">
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 text-amber-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{user.stats?.bestLapTime || '--:--'}</p>
              <p className="text-sm text-amber-300">Best Lap</p>
            </CardContent>
          </Card>
        </div>

        {/* Current Activity */}
        {user.currentSimulator && (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-bold text-white">Currently Racing</h3>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <p className="font-semibold text-white">Simulator {user.currentSimulator}</p>
                  <p className="text-sm text-slate-400">
                    Playing {user.currentGame || 'Racing Game'}
                    {user.isStreaming && (
                      <span className="ml-2 bg-red-500/20 px-2 py-1 rounded text-xs text-red-300">
                        🔴 LIVE
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Achievements */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-bold text-white">Recent Achievements</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg">
                <Trophy className="w-6 h-6 text-yellow-500" />
                <div>
                  <p className="font-semibold text-white">First Place Finish</p>
                  <p className="text-sm text-slate-400">Silverstone GP - 2 days ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg">
                <Clock className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="font-semibold text-white">Personal Best</p>
                  <p className="text-sm text-slate-400">Monaco Street Circuit - 1 week ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Screenshots Section - Placeholder for future implementation */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-bold text-white">Racing Screenshots</h3>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-slate-400">
              <Edit className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Screenshot sharing coming soon!</p>
              <p className="text-sm mt-2">Users will be able to share their best racing moments here.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}