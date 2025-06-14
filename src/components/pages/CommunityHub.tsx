import React, { useState, useEffect } from 'react';
import { Globe, Image, Heart, MessageCircle, Share2, User, Crown, Calendar, Trophy } from 'lucide-react';
import { getUsers, User as UserType, getScreenshots, Screenshot } from '../../utils/userStorage';
import Card, { CardHeader, CardContent } from '../ui/Card';
import Button from '../ui/Button';

interface CommunityHubProps {
  currentUser: UserType;
}

export default function CommunityHub({ currentUser }: CommunityHubProps) {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [filter, setFilter] = useState<'all' | 'following' | 'vip'>('all');

  useEffect(() => {
    setScreenshots(getScreenshots());
    setUsers(getUsers());
  }, []);

  const filteredScreenshots = screenshots.filter(screenshot => {
    if (filter === 'vip') {
      const user = users.find(u => u.email === screenshot.userId);
      return user?.vipMembership?.active;
    }
    return true;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getUserByEmail = (email: string) => {
    return users.find(u => u.email === email);
  };

  const handleLike = (screenshotId: string) => {
    // This would typically update the backend
    setScreenshots(prev => prev.map(s => 
      s.id === screenshotId 
        ? { ...s, likes: s.likes + (s.likedBy?.includes(currentUser.email) ? -1 : 1),
            likedBy: s.likedBy?.includes(currentUser.email) 
              ? s.likedBy.filter(email => email !== currentUser.email)
              : [...(s.likedBy || []), currentUser.email] }
        : s
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-bold text-white">Community Hub</h2>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={filter === 'all' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All Posts
              </Button>
              <Button
                variant={filter === 'vip' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setFilter('vip')}
                icon={Crown}
              >
                VIP Only
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300">
            Share your best racing moments and see what the community is up to!
          </p>
        </CardContent>
      </Card>

      {/* Screenshots Feed */}
      <div className="space-y-6">
        {filteredScreenshots.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Image className="w-12 h-12 mx-auto mb-4 text-slate-400 opacity-50" />
              <p className="text-slate-400">No screenshots shared yet.</p>
              <p className="text-sm text-slate-500 mt-2">
                Be the first to share your racing achievements!
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredScreenshots.map((screenshot) => {
            const user = getUserByEmail(screenshot.userId);
            if (!user) return null;

            const isLiked = screenshot.likedBy?.includes(currentUser.email) || false;
            const isVip = user.vipMembership?.active && new Date(user.vipMembership.expiryDate) > new Date();

            return (
              <Card key={screenshot.id}>
                <CardContent className="p-0">
                  {/* User Header */}
                  <div className="p-4 border-b border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-600/50">
                          {user.profilePicture ? (
                            <img 
                              src={user.profilePicture} 
                              alt="Profile" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="w-6 h-6 text-slate-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-white">{user.fullName}</h4>
                            {isVip && (
                              <div className="bg-red-500/20 px-2 py-1 rounded-full">
                                <span className="text-red-300 text-xs font-bold flex items-center">
                                  <Crown className="w-3 h-3 mr-1" />
                                  VIP
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-slate-400">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(screenshot.createdAt).toLocaleDateString()}</span>
                            {screenshot.game && (
                              <>
                                <span>•</span>
                                <span>{screenshot.game}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" icon={Share2}>
                        Share
                      </Button>
                    </div>
                  </div>

                  {/* Screenshot */}
                  <div className="relative">
                    <img 
                      src={screenshot.imageUrl} 
                      alt="Racing screenshot" 
                      className="w-full h-auto max-h-96 object-cover"
                    />
                    {screenshot.achievement && (
                      <div className="absolute top-4 left-4 bg-yellow-500/20 backdrop-blur-sm px-3 py-1 rounded-full border border-yellow-500/30">
                        <span className="text-yellow-300 text-sm font-bold flex items-center">
                          <Trophy className="w-3 h-3 mr-1" />
                          {screenshot.achievement}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Caption */}
                  {screenshot.caption && (
                    <div className="p-4 border-b border-slate-700/50">
                      <p className="text-slate-300">{screenshot.caption}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(screenshot.id)}
                          className={isLiked ? 'text-red-500' : ''}
                          icon={Heart}
                        >
                          {screenshot.likes || 0}
                        </Button>
                        <Button variant="ghost" size="sm" icon={MessageCircle}>
                          {screenshot.comments?.length || 0}
                        </Button>
                      </div>
                      <div className="text-sm text-slate-400">
                        {screenshot.track && `${screenshot.track} • `}
                        {screenshot.lapTime && `Lap: ${screenshot.lapTime}`}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Upload Prompt */}
      <Card className="border-dashed border-2 border-slate-600">
        <CardContent className="text-center py-8">
          <Image className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <h3 className="text-lg font-semibold text-white mb-2">Share Your Racing Moments</h3>
          <p className="text-slate-400 mb-4">
            Upload screenshots from your racing sessions to share with the community
          </p>
          <Button icon={Image}>
            Upload Screenshot
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}