import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Medal, Star, User, Clock, Target } from 'lucide-react';
import { getUsers, User as UserType } from '../../utils/userStorage';
import Card, { CardHeader, CardContent } from '../ui/Card';
import Button from '../ui/Button';

interface LeaderboardProps {
  onUserSelect: (user: UserType) => void;
}

export default function Leaderboard({ onUserSelect }: LeaderboardProps) {
  const [users, setUsers] = useState<UserType[]>([]);
  const [sortBy, setSortBy] = useState<'rank' | 'wins' | 'races'>('rank');

  useEffect(() => {
    const allUsers = getUsers();
    // Sort users based on selected criteria
    const sortedUsers = [...allUsers].sort((a, b) => {
      switch (sortBy) {
        case 'wins':
          return (b.stats?.wins || 0) - (a.stats?.wins || 0);
        case 'races':
          return (b.stats?.totalRaces || 0) - (a.stats?.totalRaces || 0);
        default:
          return (a.stats?.rank || 999) - (b.stats?.rank || 999);
      }
    });
    setUsers(sortedUsers);
  }, [sortBy]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <Star className="w-6 h-6 text-slate-500" />;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank <= 3) {
      const colors = {
        1: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        2: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
        3: 'bg-amber-600/20 text-amber-300 border-amber-600/30'
      };
      return colors[rank as keyof typeof colors];
    }
    return 'bg-slate-700/50 text-slate-300 border-slate-600/30';
  };

  return (
    <div className="space-y-6">
      {/* Top 3 Podium */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-bold text-white">Top Racers</h2>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={sortBy === 'rank' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setSortBy('rank')}
              >
                Rank
              </Button>
              <Button
                variant={sortBy === 'wins' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setSortBy('wins')}
              >
                Wins
              </Button>
              <Button
                variant={sortBy === 'races' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setSortBy('races')}
              >
                Races
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {users.length >= 3 && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              {/* 2nd Place */}
              <div className="text-center">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-500/20 border-4 border-gray-500/30 mx-auto mb-3">
                    {users[1]?.profilePicture ? (
                      <img 
                        src={users[1].profilePicture} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <Medal className="w-8 h-8 text-gray-400" />
                  </div>
                </div>
                <h3 className="font-bold text-white text-sm">{users[1]?.fullName}</h3>
                <p className="text-xs text-gray-400">2nd Place</p>
                {users[1]?.vipMembership?.active && (
                  <div className="inline-flex items-center space-x-1 bg-red-500/20 px-2 py-1 rounded-full mt-1">
                    <Crown className="w-3 h-3 text-red-400" />
                    <span className="text-xs text-red-400">VIP</span>
                  </div>
                )}
              </div>

              {/* 1st Place */}
              <div className="text-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-yellow-500/20 border-4 border-yellow-500/30 mx-auto mb-3">
                    {users[0]?.profilePicture ? (
                      <img 
                        src={users[0].profilePicture} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-10 h-10 text-yellow-500" />
                      </div>
                    )}
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <Trophy className="w-10 h-10 text-yellow-500" />
                  </div>
                </div>
                <h3 className="font-bold text-white">{users[0]?.fullName}</h3>
                <p className="text-sm text-yellow-400">Champion</p>
                {users[0]?.vipMembership?.active && (
                  <div className="inline-flex items-center space-x-1 bg-red-500/20 px-2 py-1 rounded-full mt-1">
                    <Crown className="w-3 h-3 text-red-400" />
                    <span className="text-xs text-red-400">VIP</span>
                  </div>
                )}
              </div>

              {/* 3rd Place */}
              <div className="text-center">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-amber-600/20 border-4 border-amber-600/30 mx-auto mb-3">
                    {users[2]?.profilePicture ? (
                      <img 
                        src={users[2].profilePicture} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-8 h-8 text-amber-600" />
                      </div>
                    )}
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <Medal className="w-8 h-8 text-amber-600" />
                  </div>
                </div>
                <h3 className="font-bold text-white text-sm">{users[2]?.fullName}</h3>
                <p className="text-xs text-amber-400">3rd Place</p>
                {users[2]?.vipMembership?.active && (
                  <div className="inline-flex items-center space-x-1 bg-red-500/20 px-2 py-1 rounded-full mt-1">
                    <Crown className="w-3 h-3 text-red-400" />
                    <span className="text-xs text-red-400">VIP</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full Leaderboard */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-bold text-white">Full Rankings</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((user, index) => (
              <div 
                key={user.email}
                className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer"
                onClick={() => onUserSelect(user)}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${getRankBadge(index + 1)}`}>
                    <span className="text-sm font-bold">#{index + 1}</span>
                  </div>
                  
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-600/50 border-2 border-slate-500/30">
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
                      {user.vipMembership?.active && (
                        <div className="bg-red-500/20 px-2 py-1 rounded-full border border-red-500/30">
                          <span className="text-red-300 text-xs font-bold flex items-center">
                            <Crown className="w-3 h-3 mr-1" />
                            VIP
                          </span>
                        </div>
                      )}
                      {user.isOnline && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-sm text-slate-400">
                      {user.bio || 'Racing enthusiast'}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="text-center">
                      <p className="text-slate-400">Races</p>
                      <p className="font-semibold text-white">{user.stats?.totalRaces || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-400">Wins</p>
                      <p className="font-semibold text-green-400">{user.stats?.wins || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-400">Best Time</p>
                      <p className="font-semibold text-blue-400 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {user.stats?.bestLapTime || '--:--'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}