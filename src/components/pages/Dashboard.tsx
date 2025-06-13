import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  LogOut, 
  Calendar, 
  Trophy, 
  Clock, 
  Settings,
  Car,
  BarChart3,
  Star,
  Edit3,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Users,
  Crown,
  Zap,
  Timer,
  History,
  Gamepad2,
  Shield,
  Monitor
} from 'lucide-react';
import { getSession, clearSession, User as UserType, formatCreditsDisplay, getUserTransactions } from '../../utils/userStorage';
import Button from '../ui/Button';
import Card, { CardHeader, CardContent } from '../ui/Card';
import Modal from '../ui/Modal';
import ProfileEdit from './ProfileEdit';
import BookingModal from './BookingModal';
import TransactionHistory from './TransactionHistory';
import Leaderboard from './Leaderboard';
import UserProfile from './UserProfile';
import GamesLibrary from './GamesLibrary';
import AdminDashboard from './AdminDashboard';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [isPackagesExpanded, setIsPackagesExpanded] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

  useEffect(() => {
    const sessionUser = getSession();
    if (!sessionUser) {
      navigate('/login');
    } else {
      setUser(sessionUser);
    }
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    clearSession();
    navigate('/');
  };

  const handleProfileSave = (updatedUser: UserType) => {
    setUser(updatedUser);
    setIsEditModalOpen(false);
  };

  const handleBookingComplete = (updatedUser: UserType) => {
    setUser(updatedUser);
    setIsBookingModalOpen(false);
  };

  const handleBookPackage = (packageData: any) => {
    setSelectedPackage(packageData);
    setIsBookingModalOpen(true);
  };

  const handleUserSelect = (selectedUser: UserType) => {
    setSelectedUser(selectedUser);
  };

  const racingPackages = [
    {
      id: 'basic',
      name: 'TrackPass Basic',
      price: 30,
      duration: '30 min',
      description: 'Solo only. No guests.',
      features: ['30 minutes of racing', 'Solo experience', 'Basic telemetry'],
      color: 'from-slate-500/20 to-slate-600/10',
      icon: Car,
      credits: 30
    },
    {
      id: 'plus',
      name: 'TrackPass Plus',
      price: 45,
      duration: '30 min',
      description: 'Includes 1 guest.',
      features: ['30 minutes of racing', '1 guest included', 'Advanced telemetry', 'Photo package'],
      color: 'from-blue-500/20 to-blue-600/10',
      icon: Users,
      credits: 30
    },
    {
      id: 'pro',
      name: 'TrackPass Pro',
      price: 60,
      duration: '30 min',
      description: 'Includes 2 guests.',
      features: ['30 minutes of racing', '2 guests included', 'Pro telemetry', 'Video recording', 'Coaching tips'],
      color: 'from-purple-500/20 to-purple-600/10',
      icon: Trophy,
      credits: 30
    },
    {
      id: 'elite',
      name: 'TrackPass Elite',
      price: 99.99,
      duration: '30 min',
      description: 'Includes 3 guests.',
      features: ['30 minutes of racing', '3 guests included', 'Elite telemetry', 'Professional video', 'Personal coaching', 'Priority booking'],
      color: 'from-amber-500/20 to-amber-600/10',
      icon: Crown,
      credits: 30
    }
  ];

  const vipMembership = {
    id: 'vip',
    name: 'TrackPass VIP Membership',
    price: 49.99,
    duration: 'monthly',
    description: '25% discount on all sessions + 30 minutes',
    features: [
      '25% discount on all sessions',
      '30 minutes of racing credits included',
      '4 guest passes per month (1 per week, non-stacking)',
      '2 free entries/month to exclusive events or sim challenges',
      'Exclusive merch drops and giveaway',
      'Priority access to bookings and exclusive content',
      'Recognition on VIP leaderboard'
    ],
    color: 'from-red-500/20 to-red-600/10',
    icon: Zap,
    credits: 30
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-900/20 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const memberSince = user.registrationDate 
    ? new Date(user.registrationDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      })
    : 'Recently';

  const isVipActive = user.vipMembership?.active && new Date(user.vipMembership.expiryDate) > new Date();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'transactions':
        return <TransactionHistory user={user} />;
      case 'leaderboard':
        return <Leaderboard onUserSelect={handleUserSelect} />;
      case 'games':
        return <GamesLibrary user={user} />;
      case 'admin':
        return user.isAdmin ? <AdminDashboard /> : null;
      default:
        return (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-green-500/20 to-green-600/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-300 text-sm font-medium">Racing Credits</p>
                      <p className="text-3xl font-bold text-white">{formatCreditsDisplay(user.racingCredits || 0)}</p>
                    </div>
                    <Timer className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-amber-300 text-sm font-medium">Best Lap Time</p>
                      <p className="text-3xl font-bold text-white">{user.stats?.bestLapTime || '--:--'}</p>
                    </div>
                    <Clock className="w-8 h-8 text-amber-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-500/20 to-red-600/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-300 text-sm font-medium">Current Rank</p>
                      <p className="text-3xl font-bold text-white">#{user.stats?.rank || '--'}</p>
                    </div>
                    <Star className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Racing Packages Section */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-5 h-5 text-red-500" />
                    <h2 className="text-xl font-bold text-white">Racing Packages</h2>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setIsPackagesExpanded(!isPackagesExpanded)}
                    icon={isPackagesExpanded ? ChevronUp : ChevronDown}
                  >
                    {isPackagesExpanded ? 'Hide' : 'Show'} Packages
                  </Button>
                </div>
              </CardHeader>
              
              {isPackagesExpanded && (
                <CardContent className="space-y-6">
                  {/* VIP Membership - Featured */}
                  <div className="border border-red-500/30 rounded-lg p-1 bg-gradient-to-r from-red-500/10 to-red-600/5">
                    <Card className={`bg-gradient-to-br ${vipMembership.color} border-0`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                              <vipMembership.icon className="w-6 h-6 text-red-500" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-white">{vipMembership.name}</h3>
                              <p className="text-red-300 font-semibold">${vipMembership.price}/{vipMembership.duration}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <div className="bg-red-500/20 px-3 py-1 rounded-full">
                              <span className="text-red-300 text-sm font-bold">FEATURED</span>
                            </div>
                            {isVipActive && (
                              <div className="bg-green-500/20 px-3 py-1 rounded-full">
                                <span className="text-green-300 text-xs font-bold">ACTIVE</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-slate-300 mb-4">{vipMembership.description}</p>
                        
                        <div className="grid md:grid-cols-2 gap-2 mb-6">
                          {vipMembership.features.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm text-slate-300">
                              <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                        
                        <Button 
                          className="w-full"
                          onClick={() => handleBookPackage(vipMembership)}
                          disabled={isVipActive}
                        >
                          {isVipActive ? 'VIP Active' : 'Subscribe to VIP'}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Regular Packages */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {racingPackages.map((pkg) => (
                      <Card key={pkg.id} className={`bg-gradient-to-br ${pkg.color}`}>
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-slate-700/30 rounded-full flex items-center justify-center">
                              <pkg.icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-white">{pkg.name}</h3>
                              <p className="text-slate-300 text-sm">${pkg.price} / {pkg.duration}</p>
                            </div>
                          </div>
                          
                          <p className="text-slate-400 text-sm mb-2">{pkg.description}</p>
                          <p className="text-green-400 text-xs font-semibold mb-4">+{pkg.credits} minutes</p>
                          
                          <div className="space-y-2 mb-6">
                            {pkg.features.map((feature, index) => (
                              <div key={index} className="flex items-center space-x-2 text-xs text-slate-300">
                                <div className="w-1 h-1 bg-slate-400 rounded-full flex-shrink-0" />
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                          
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => handleBookPackage(pkg)}
                          >
                            Buy Credits
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Upcoming Sessions */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-red-500" />
                      <h2 className="text-xl font-bold text-white">Upcoming Sessions</h2>
                    </div>
                    <Button variant="ghost" size="sm">View All</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { date: 'Today, 3:00 PM', track: 'Silverstone GP', type: 'Practice Session' },
                      { date: 'Tomorrow, 7:00 PM', track: 'Monaco Street', type: 'Qualifying' },
                      { date: 'Friday, 6:00 PM', track: 'Spa-Francorchamps', type: 'Championship Race' }
                    ].map((session, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                        <div>
                          <p className="font-semibold text-white">{session.track}</p>
                          <p className="text-sm text-slate-400">{session.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-red-400 font-medium">{session.date}</p>
                          <Button variant="ghost" size="sm" className="text-xs">Join</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Profile Summary */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-red-500" />
                      <h2 className="text-xl font-bold text-white">Profile</h2>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsEditModalOpen(true)}
                      icon={Edit3}
                    >
                      Edit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center pb-4 border-b border-slate-700">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-red-500/20 border-2 border-red-500/30 mx-auto mb-3">
                      {user.profilePicture ? (
                        <img 
                          src={user.profilePicture} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-10 h-10 text-red-500" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-bold text-white">{user.fullName}</h3>
                    <p className="text-sm text-slate-400">{user.email}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Phone:</span>
                      <span className="text-white">{user.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Emergency Contact:</span>
                      <span className="text-white">{user.emergencyName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Racing Credits:</span>
                      <span className="text-green-400 font-semibold">{formatCreditsDisplay(user.racingCredits || 0)}</span>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-4" 
                    icon={Settings}
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="mt-8">
              <CardHeader>
                <h2 className="text-xl font-bold text-white">Recent Activity</h2>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-slate-400">
                  <Car className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Your racing sessions and achievements will appear here.</p>
                  <p className="text-sm mt-2">Purchase credits to get started!</p>
                </div>
              </CardContent>
            </Card>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-900/20">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-red-500/20 border-2 border-red-500/30">
                {user.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-6 h-6 text-red-500" />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold text-white">
                    Welcome back, {user.fullName.split(' ')[0]}!
                  </h1>
                  {isVipActive && (
                    <div className="bg-red-500/20 px-2 py-1 rounded-full border border-red-500/30">
                      <span className="text-red-300 text-xs font-bold flex items-center">
                        <Crown className="w-3 h-3 mr-1" />
                        VIP
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <p className="text-slate-400">Member since {memberSince}</p>
                  <div className="flex items-center space-x-1 text-green-400">
                    <Timer className="w-4 h-4" />
                    <span className="font-semibold">{formatCreditsDisplay(user.racingCredits || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <Button variant="ghost" onClick={handleLogout} icon={LogOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-slate-800/30 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-red-500 text-red-500'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Dashboard</span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'transactions'
                  ? 'border-red-500 text-red-500'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <History className="w-4 h-4" />
                <span>Transaction History</span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'leaderboard'
                  ? 'border-red-500 text-red-500'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4" />
                <span>Leaderboard</span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveTab('games')}
              className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === 'games'
                  ? 'border-red-500 text-red-500'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Gamepad2 className="w-4 h-4" />
                <span>Games</span>
              </div>
            </button>
            
            {user.isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === 'admin'
                    ? 'border-red-500 text-red-500'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Admin</span>
                </div>
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {renderTabContent()}
      </main>

      {/* Profile Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile"
      >
        <ProfileEdit
          user={user}
          onSave={handleProfileSave}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      {/* Booking Modal */}
      <Modal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        title="Purchase Racing Package"
      >
        <BookingModal
          package={selectedPackage}
          user={user}
          onClose={() => setIsBookingModalOpen(false)}
          onComplete={handleBookingComplete}
        />
      </Modal>

      {/* User Profile Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="User Profile"
      >
        {selectedUser && (
          <UserProfile
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
          />
        )}
      </Modal>
    </div>
  );
}