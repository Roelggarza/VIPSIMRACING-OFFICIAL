import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  LogOut, 
  Settings, 
  CreditCard, 
  Trophy, 
  Clock, 
  Users, 
  Crown, 
  Calendar, 
  Target, 
  Monitor, 
  Globe, 
  History, 
  Edit, 
  Shield, 
  Bell,
  MessageCircle,
  Gamepad2,
  QrCode,
  Phone,
  Mail,
  MapPin,
  Timer,
  Wallet,
  Star,
  Activity,
  Zap,
  Gift
} from 'lucide-react';
import { getSession, clearSession, User as UserType, formatCreditsDisplay, getSimulators } from '../../utils/userStorage';
import Button from '../ui/Button';
import Card, { CardHeader, CardContent } from '../ui/Card';
import Modal from '../ui/Modal';
import BookingModal from './BookingModal';
import TransactionHistory from './TransactionHistory';
import ProfileEdit from './ProfileEdit';
import UserProfile from './UserProfile';
import Leaderboard from './Leaderboard';
import CommunityHub from './CommunityHub';
import GamesLibrary from './GamesLibrary';
import AdminDashboard from './AdminDashboard';
import SpotifyWidget from '../ui/SpotifyWidget';
import AIChat from '../ui/AIChat';
import PasswordReset from '../ui/PasswordReset';
import QRCode from 'qrcode.react';

interface UpcomingSession {
  id: string;
  date: string;
  time: string;
  simulator: number;
  package: string;
  guests: number;
}

export default function Dashboard() {
  const [user, setUser] = useState<UserType | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'packages' | 'history' | 'profile' | 'leaderboard' | 'community' | 'games' | 'admin'>('overview');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showSpotifyWidget, setShowSpotifyWidget] = useState(false);
  const [upcomingSessions] = useState<UpcomingSession[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const session = getSession();
    if (!session) {
      navigate('/login');
      return;
    }
    setUser(session);
    
    // Show Spotify widget if connected
    if (session.spotifyData?.connected) {
      setShowSpotifyWidget(true);
    }
  }, [navigate]);

  const handleLogout = () => {
    clearSession();
    navigate('/');
  };

  const handlePackageSelect = (pkg: any) => {
    setSelectedPackage(pkg);
    setShowBookingModal(true);
  };

  const handleBookingComplete = (updatedUser: UserType) => {
    setUser(updatedUser);
    setShowBookingModal(false);
    setSelectedPackage(null);
  };

  const handleProfileSave = (updatedUser: UserType) => {
    setUser(updatedUser);
    setShowProfileEdit(false);
  };

  const handleUserSelect = (selectedUser: UserType) => {
    setSelectedUser(selectedUser);
    setShowUserProfile(true);
  };

  const handlePasswordResetComplete = () => {
    setShowPasswordReset(false);
    // Optionally refresh user data or show success message
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const isVipActive = user.vipMembership?.active && new Date(user.vipMembership.expiryDate) > new Date();
  const currentCredits = user.racingCredits || 0;
  const currentBalance = user.accountBalance || 0;
  const simulators = getSimulators();
  const activeSimulators = simulators.filter(s => s.isActive).length;

  const racingPackages = [
    {
      id: 'basic',
      name: 'TrackPass Basic',
      price: 30,
      duration: '30 min',
      description: '1 Driver',
      features: ['30 minutes of racing', '1 driver', 'Basic telemetry'],
      color: 'from-slate-500/20 to-slate-600/10',
      credits: 30
    },
    {
      id: 'plus',
      name: 'TrackPass Plus',
      price: 45,
      duration: '30 min',
      description: '2 Drivers',
      features: ['30 minutes of racing', '2 drivers', 'Advanced telemetry', 'Photo package'],
      color: 'from-blue-500/20 to-blue-600/10',
      credits: 30
    },
    {
      id: 'pro',
      name: 'TrackPass Pro',
      price: 60,
      duration: '30 min',
      description: '3 Drivers',
      features: ['30 minutes of racing', '3 drivers', 'Pro telemetry', 'Video recording', 'Coaching tips'],
      color: 'from-purple-500/20 to-purple-600/10',
      credits: 30
    },
    {
      id: 'elite',
      name: 'TrackPass Elite',
      price: 99.99,
      duration: '30 min',
      description: '4 Drivers',
      features: ['30 minutes of racing', '4 drivers', 'Elite telemetry', 'Professional video', 'Personal coaching', 'Priority booking'],
      color: 'from-amber-500/20 to-amber-600/10',
      credits: 30
    }
  ];

  const vipMembership = {
    id: 'vip',
    name: 'TrackPass VIP Membership',
    price: 49.99,
    duration: 'monthly',
    description: '25% discount + 30 minutes included',
    features: [
      '25% discount on all sessions',
      '30 minutes of racing credits included',
      '4 guest passes per month',
      '2 free entries/month to exclusive events',
      'Exclusive merch drops and giveaways',
      'Priority access to bookings',
      'Recognition on VIP leaderboard'
    ],
    color: 'from-red-500/20 to-red-600/10',
    credits: 30,
    savings: 'Save $10.01 vs TrackPass Pro!'
  };

  const getVipPrice = (originalPrice: number) => {
    if (isVipActive) {
      return originalPrice * 0.75; // 25% discount
    }
    return originalPrice;
  };

  const dashboardUrl = window.location.origin + "/dashboard";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-900/20 py-8 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-700/50 border-4 border-slate-600">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-8 h-8 text-slate-400" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Welcome back, {user.fullName.split(' ')[0]}!
              </h1>
              <div className="flex items-center space-x-4 text-slate-400">
                <span>{user.email}</span>
                {isVipActive && (
                  <div className="bg-red-500/20 px-3 py-1 rounded-full border border-red-500/30">
                    <span className="text-red-300 text-sm font-bold flex items-center">
                      <Crown className="w-3 h-3 mr-1" />
                      VIP MEMBER
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="ghost" onClick={() => setShowAIChat(true)} icon={MessageCircle}>
              AI Support
            </Button>
            <Button variant="ghost" onClick={() => setShowPasswordReset(true)} icon={Settings}>
              Security
            </Button>
            <Button variant="outline" onClick={handleLogout} icon={LogOut}>
              Logout
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 bg-slate-800/50 p-2 rounded-lg">
          <Button
            variant={activeTab === 'overview' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('overview')}
            icon={Target}
          >
            Overview
          </Button>
          <Button
            variant={activeTab === 'packages' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('packages')}
            icon={CreditCard}
          >
            Racing Packages
          </Button>
          <Button
            variant={activeTab === 'games' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('games')}
            icon={Gamepad2}
          >
            Games Library
          </Button>
          <Button
            variant={activeTab === 'community' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('community')}
            icon={Globe}
          >
            Community
          </Button>
          <Button
            variant={activeTab === 'leaderboard' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('leaderboard')}
            icon={Trophy}
          >
            Leaderboard
          </Button>
          <Button
            variant={activeTab === 'history' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('history')}
            icon={History}
          >
            History
          </Button>
          <Button
            variant={activeTab === 'profile' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('profile')}
            icon={User}
          >
            Profile
          </Button>
          {user.isAdmin && (
            <Button
              variant={activeTab === 'admin' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('admin')}
              icon={Shield}
            >
              Admin
            </Button>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Account Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-green-500/20 to-green-600/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-300 text-sm font-medium">Racing Credits</p>
                      <p className="text-2xl font-bold text-white">{formatCreditsDisplay(currentCredits)}</p>
                    </div>
                    <Timer className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-300 text-sm font-medium">Account Balance</p>
                      <p className="text-2xl font-bold text-white">${currentBalance.toFixed(2)}</p>
                    </div>
                    <Wallet className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-300 text-sm font-medium">Total Races</p>
                      <p className="text-2xl font-bold text-white">{user.stats?.totalRaces || 0}</p>
                    </div>
                    <Trophy className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-amber-300 text-sm font-medium">Best Lap Time</p>
                      <p className="text-2xl font-bold text-white">{user.stats?.bestLapTime || '--:--'}</p>
                    </div>
                    <Clock className="w-8 h-8 text-amber-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold text-white">Quick Actions</h2>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2"
                    onClick={() => setActiveTab('packages')}
                  >
                    <CreditCard className="w-6 h-6" />
                    <span className="text-sm">Buy Credits</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2"
                    onClick={() => setActiveTab('games')}
                  >
                    <Gamepad2 className="w-6 h-6" />
                    <span className="text-sm">Play Games</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2"
                    onClick={() => setActiveTab('community')}
                  >
                    <Globe className="w-6 h-6" />
                    <span className="text-sm">Community</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col space-y-2"
                    onClick={() => setShowProfileEdit(true)}
                  >
                    <Edit className="w-6 h-6" />
                    <span className="text-sm">Edit Profile</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* QR Code for Mobile Access */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <QrCode className="w-5 h-5 text-red-500" />
                  <h2 className="text-xl font-bold text-white">Mobile Access</h2>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-6">
                  <div className="bg-white p-4 rounded-lg">
                    <QRCode 
                      value={dashboardUrl} 
                      size={120}
                      fgColor="#ef4444"
                      bgColor="#ffffff"
                      level="M"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">Quick Dashboard Access</h3>
                    <p className="text-slate-300 mb-4">
                      Scan this QR code with your mobile device to quickly access your racing dashboard on the go.
                    </p>
                    <div className="space-y-2 text-sm text-slate-400">
                      <p>• View your racing credits and balance</p>
                      <p>• Check upcoming sessions</p>
                      <p>• Access community features</p>
                      <p>• Purchase additional packages</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Sessions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-red-500" />
                    <h2 className="text-xl font-bold text-white">Upcoming Sessions</h2>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('packages')}>
                    Book Session
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {upcomingSessions.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No upcoming sessions scheduled.</p>
                    <p className="text-sm mt-2">Book a racing package to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingSessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                            <Monitor className="w-6 h-6 text-red-500" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">{session.package}</p>
                            <p className="text-sm text-slate-400">
                              {new Date(session.date + 'T' + session.time).toLocaleDateString()} at {session.time}
                            </p>
                            <p className="text-xs text-slate-500">
                              Simulator {session.simulator} • {session.guests} guest{session.guests !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Button variant="outline" size="sm">
                            Modify
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold text-white">Contact VIP SIM RACING</h2>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-6 h-6 text-red-500" />
                    <div>
                      <p className="font-semibold text-white">Phone</p>
                      <a 
                        href="tel:8008975419" 
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        (800) 897-5419
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Mail className="w-6 h-6 text-red-500" />
                    <div>
                      <p className="font-semibold text-white">Email</p>
                      <a 
                        href="mailto:roel@vipsimracing.com" 
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        roel@vipsimracing.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-6 h-6 text-red-500" />
                    <div>
                      <p className="font-semibold text-white">Location</p>
                      <p className="text-slate-400">Houston, Texas Area</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'packages' && (
          <div className="space-y-8">
            {/* VIP Membership - Featured */}
            {!isVipActive && (
              <div className="border-2 border-red-500/50 rounded-lg p-1 bg-gradient-to-r from-red-500/10 to-red-600/5">
                <Card className={`bg-gradient-to-br ${vipMembership.color} border-0`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                          <Zap className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{vipMembership.name}</h3>
                          <p className="text-red-300 font-semibold">${vipMembership.price}/{vipMembership.duration}</p>
                          <p className="text-green-400 text-sm font-bold">{vipMembership.savings}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <div className="bg-red-500/20 px-3 py-1 rounded-full">
                          <span className="text-red-300 text-sm font-bold flex items-center">
                            <Crown className="w-3 h-3 mr-1" />
                            BEST VALUE
                          </span>
                        </div>
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
                      onClick={() => handlePackageSelect(vipMembership)}
                      icon={Crown}
                    >
                      Upgrade to VIP Membership
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Racing Packages */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {racingPackages.map((pkg) => {
                const discountedPrice = getVipPrice(pkg.price);
                const hasDiscount = isVipActive && discountedPrice < pkg.price;

                return (
                  <Card key={pkg.id} className={`bg-gradient-to-br ${pkg.color} hover:scale-105 transition-all duration-200`}>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-slate-700/30 rounded-full flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white">{pkg.name}</h3>
                          <div className="flex items-center space-x-2">
                            {hasDiscount && (
                              <span className="text-slate-400 line-through text-sm">${pkg.price}</span>
                            )}
                            <span className="text-slate-300 font-semibold">
                              ${discountedPrice.toFixed(2)} / {pkg.duration}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-slate-400 text-sm mb-2">{pkg.description}</p>
                      <p className="text-green-400 text-xs font-semibold mb-4">+{formatCreditsDisplay(pkg.credits)}</p>
                      
                      <div className="space-y-2 mb-6">
                        {pkg.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2 text-xs text-slate-300">
                            <div className="w-1 h-1 bg-slate-400 rounded-full flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      {hasDiscount && (
                        <div className="bg-red-500/20 px-2 py-1 rounded text-xs text-red-300 text-center mb-4">
                          VIP DISCOUNT: Save ${(pkg.price - discountedPrice).toFixed(2)}
                        </div>
                      )}
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => handlePackageSelect(pkg)}
                      >
                        Purchase Package
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Simulator Status */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Monitor className="w-5 h-5 text-red-500" />
                  <h2 className="text-xl font-bold text-white">Simulator Status</h2>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {simulators.map((simulator) => (
                    <div key={simulator.id} className="text-center p-4 bg-slate-700/30 rounded-lg">
                      <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
                        simulator.isActive ? 'bg-green-500/20' : 'bg-red-500/20'
                      }`}>
                        <Monitor className={`w-6 h-6 ${simulator.isActive ? 'text-green-500' : 'text-red-500'}`} />
                      </div>
                      <p className="font-semibold text-white text-sm">{simulator.name}</p>
                      <p className={`text-xs ${simulator.isActive ? 'text-green-400' : 'text-red-400'}`}>
                        {simulator.isActive ? 'Available' : 'Offline'}
                      </p>
                      {simulator.currentUser && (
                        <p className="text-xs text-slate-400 mt-1">
                          {simulator.currentUser.fullName}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <p className="text-slate-400 text-sm">
                    {activeSimulators} of {simulators.length} simulators currently available
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'packages' && (
          <div className="space-y-8">
            {/* VIP Membership - Featured */}
            {!isVipActive && (
              <div className="border-2 border-red-500/50 rounded-lg p-1 bg-gradient-to-r from-red-500/10 to-red-600/5">
                <Card className={`bg-gradient-to-br ${vipMembership.color} border-0`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                          <Zap className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{vipMembership.name}</h3>
                          <p className="text-red-300 font-semibold">${vipMembership.price}/{vipMembership.duration}</p>
                          <p className="text-green-400 text-sm font-bold">{vipMembership.savings}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <div className="bg-red-500/20 px-3 py-1 rounded-full">
                          <span className="text-red-300 text-sm font-bold flex items-center">
                            <Crown className="w-3 h-3 mr-1" />
                            BEST VALUE
                          </span>
                        </div>
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
                      onClick={() => handlePackageSelect(vipMembership)}
                      icon={Crown}
                    >
                      Upgrade to VIP Membership
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Racing Packages */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {racingPackages.map((pkg) => {
                const discountedPrice = getVipPrice(pkg.price);
                const hasDiscount = isVipActive && discountedPrice < pkg.price;

                return (
                  <Card key={pkg.id} className={`bg-gradient-to-br ${pkg.color} hover:scale-105 transition-all duration-200`}>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-slate-700/30 rounded-full flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white">{pkg.name}</h3>
                          <div className="flex items-center space-x-2">
                            {hasDiscount && (
                              <span className="text-slate-400 line-through text-sm">${pkg.price}</span>
                            )}
                            <span className="text-slate-300 font-semibold">
                              ${discountedPrice.toFixed(2)} / {pkg.duration}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-slate-400 text-sm mb-2">{pkg.description}</p>
                      <p className="text-green-400 text-xs font-semibold mb-4">+{formatCreditsDisplay(pkg.credits)}</p>
                      
                      <div className="space-y-2 mb-6">
                        {pkg.features.map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2 text-xs text-slate-300">
                            <div className="w-1 h-1 bg-slate-400 rounded-full flex-shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      {hasDiscount && (
                        <div className="bg-red-500/20 px-2 py-1 rounded text-xs text-red-300 text-center mb-4">
                          VIP DISCOUNT: Save ${(pkg.price - discountedPrice).toFixed(2)}
                        </div>
                      )}
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => handlePackageSelect(pkg)}
                      >
                        Purchase Package
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'history' && <TransactionHistory user={user} />}
        {activeTab === 'profile' && !showProfileEdit && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Your Profile</h2>
              <Button onClick={() => setShowProfileEdit(true)} icon={Edit}>
                Edit Profile
              </Button>
            </div>
            <UserProfile user={user} onClose={() => {}} />
          </div>
        )}
        {activeTab === 'leaderboard' && <Leaderboard onUserSelect={handleUserSelect} />}
        {activeTab === 'community' && <CommunityHub currentUser={user} />}
        {activeTab === 'games' && <GamesLibrary user={user} />}
        {activeTab === 'admin' && user.isAdmin && <AdminDashboard />}
      </div>

      {/* Modals */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false);
          setSelectedPackage(null);
        }}
        title={`Purchase ${selectedPackage?.name || 'Package'}`}
      >
        {selectedPackage && (
          <BookingModal
            package={selectedPackage}
            user={user}
            onClose={() => {
              setShowBookingModal(false);
              setSelectedPackage(null);
            }}
            onComplete={handleBookingComplete}
          />
        )}
      </Modal>

      <Modal
        isOpen={showProfileEdit}
        onClose={() => setShowProfileEdit(false)}
        title="Edit Profile"
      >
        <ProfileEdit
          user={user}
          onSave={handleProfileSave}
          onCancel={() => setShowProfileEdit(false)}
        />
      </Modal>

      <Modal
        isOpen={showUserProfile}
        onClose={() => {
          setShowUserProfile(false);
          setSelectedUser(null);
        }}
        title={selectedUser?.fullName || 'User Profile'}
      >
        {selectedUser && (
          <UserProfile
            user={selectedUser}
            onClose={() => {
              setShowUserProfile(false);
              setSelectedUser(null);
            }}
          />
        )}
      </Modal>

      <Modal
        isOpen={showPasswordReset}
        onClose={() => setShowPasswordReset(false)}
        title="Change Password"
      >
        <PasswordReset
          userEmail={user.email}
          onComplete={handlePasswordResetComplete}
        />
      </Modal>

      {/* Spotify Widget */}
      {showSpotifyWidget && user.spotifyData?.connected && (
        <SpotifyWidget
          spotifyData={user.spotifyData}
          onClose={() => setShowSpotifyWidget(false)}
          compact={true}
        />
      )}

      {/* AI Chat */}
      <AIChat
        currentUser={user}
        isOpen={showAIChat}
        onClose={() => setShowAIChat(false)}
        initialType="support"
      />
    </div>
  );
}