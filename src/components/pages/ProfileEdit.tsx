import React, { useState } from 'react';
import { Save, AlertCircle, CheckCircle, Upload, Image, Link, ExternalLink, Unlink } from 'lucide-react';
import { User, updateUser } from '../../utils/userStorage';
import Button from '../ui/Button';
import Input from '../ui/Input';
import ImageUpload from '../ui/ImageUpload';

interface ProfileEditProps {
  user: User;
  onSave: (updatedUser: User) => void;
  onCancel: () => void;
}

interface FormData {
  fullName: string;
  phone: string;
  address: string;
  state: string;
  zipCode: string;
  emergencyName: string;
  emergencyPhone: string;
  profilePicture: string;
  bannerImage: string;
  bio: string;
  socialAccounts: {
    steam?: {
      username: string;
      profileUrl: string;
      connected: boolean;
    };
    discord?: {
      username: string;
      discriminator: string;
      connected: boolean;
    };
    twitch?: {
      username: string;
      profileUrl: string;
      connected: boolean;
    };
    youtube?: {
      channelName: string;
      channelUrl: string;
      connected: boolean;
    };
    twitter?: {
      username: string;
      profileUrl: string;
      connected: boolean;
    };
    personalWebsite?: {
      url: string;
      title: string;
      connected: boolean;
    };
  };
}

interface FormErrors {
  [key: string]: string;
}

export default function ProfileEdit({ user, onSave, onCancel }: ProfileEditProps) {
  const [form, setForm] = useState<FormData>({
    fullName: user.fullName,
    phone: user.phone,
    address: user.address || '',
    state: user.state || '',
    zipCode: user.zipCode || '',
    emergencyName: user.emergencyName,
    emergencyPhone: user.emergencyPhone,
    profilePicture: user.profilePicture || '',
    bannerImage: user.bannerImage || '',
    bio: user.bio || '',
    socialAccounts: {
      steam: user.socialAccounts?.steam || { username: '', profileUrl: '', connected: false },
      discord: user.socialAccounts?.discord || { username: '', discriminator: '', connected: false },
      twitch: user.socialAccounts?.twitch || { username: '', profileUrl: '', connected: false },
      youtube: user.socialAccounts?.youtube || { channelName: '', channelUrl: '', connected: false },
      twitter: user.socialAccounts?.twitter || { username: '', profileUrl: '', connected: false },
      personalWebsite: user.socialAccounts?.personalWebsite || { url: '', title: '', connected: false }
    }
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'social'>('profile');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSocialAccountChange = (platform: string, field: string, value: string) => {
    setForm(prev => ({
      ...prev,
      socialAccounts: {
        ...prev.socialAccounts,
        [platform]: {
          ...prev.socialAccounts[platform as keyof typeof prev.socialAccounts],
          [field]: value
        }
      }
    }));
  };

  const connectSocialAccount = (platform: string) => {
    const account = form.socialAccounts[platform as keyof typeof form.socialAccounts];
    if (!account) return;

    // Validate required fields
    let isValid = false;
    switch (platform) {
      case 'steam':
        isValid = !!(account as any).username;
        if (isValid && !(account as any).profileUrl) {
          handleSocialAccountChange(platform, 'profileUrl', `https://steamcommunity.com/id/${(account as any).username}`);
        }
        break;
      case 'discord':
        isValid = !!(account as any).username;
        break;
      case 'twitch':
        isValid = !!(account as any).username;
        if (isValid && !(account as any).profileUrl) {
          handleSocialAccountChange(platform, 'profileUrl', `https://twitch.tv/${(account as any).username}`);
        }
        break;
      case 'youtube':
        isValid = !!(account as any).channelName;
        break;
      case 'twitter':
        isValid = !!(account as any).username;
        if (isValid && !(account as any).profileUrl) {
          handleSocialAccountChange(platform, 'profileUrl', `https://twitter.com/${(account as any).username}`);
        }
        break;
      case 'personalWebsite':
        isValid = !!(account as any).url && !!(account as any).title;
        break;
    }

    if (isValid) {
      handleSocialAccountChange(platform, 'connected', true);
    }
  };

  const disconnectSocialAccount = (platform: string) => {
    handleSocialAccountChange(platform, 'connected', false);
  };

  const handleImageChange = (imageData: string, type: 'profile' | 'banner') => {
    if (type === 'profile') {
      setForm(prev => ({ ...prev, profilePicture: imageData }));
    } else {
      setForm(prev => ({ ...prev, bannerImage: imageData }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!form.address.trim()) newErrors.address = 'Address is required';
    if (!form.state.trim()) newErrors.state = 'State is required';
    if (!form.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    if (!form.emergencyName.trim()) newErrors.emergencyName = 'Emergency contact name is required';
    if (!form.emergencyPhone.trim()) newErrors.emergencyPhone = 'Emergency contact phone is required';
    if (form.bio.length > 200) newErrors.bio = 'Bio must be 200 characters or less';

    // Validate social account URLs
    if (form.socialAccounts.personalWebsite?.connected && form.socialAccounts.personalWebsite.url) {
      try {
        new URL(form.socialAccounts.personalWebsite.url);
      } catch {
        newErrors.personalWebsiteUrl = 'Please enter a valid URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      const updatedUser: User = {
        ...user,
        fullName: form.fullName,
        phone: form.phone,
        address: form.address,
        state: form.state,
        zipCode: form.zipCode,
        emergencyName: form.emergencyName,
        emergencyPhone: form.emergencyPhone,
        profilePicture: form.profilePicture,
        bannerImage: form.bannerImage,
        bio: form.bio,
        socialAccounts: form.socialAccounts,
      };

      updateUser(updatedUser);
      setShowSuccess(true);
      setIsLoading(false);

      // Auto-close success message and call onSave
      setTimeout(() => {
        setShowSuccess(false);
        onSave(updatedUser);
      }, 1500);
    }, 800);
  };

  if (showSuccess) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white">Profile Updated!</h3>
          <p className="text-slate-300">Your changes have been saved successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-slate-700/30 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'profile'
              ? 'bg-red-500 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Profile Settings
        </button>
        <button
          onClick={() => setActiveTab('social')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'social'
              ? 'bg-red-500 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Social Accounts
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {activeTab === 'profile' ? (
          <>
            {/* Profile Images */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
                Profile Images
              </h3>
              
              {/* Banner Image */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-300">
                  Profile Banner
                </label>
                <ImageUpload
                  currentImage={form.bannerImage}
                  onImageChange={(imageData) => handleImageChange(imageData, 'banner')}
                  type="banner"
                />
              </div>

              {/* Profile Picture */}
              <div className="text-center">
                <label className="block text-sm font-medium text-slate-300 mb-4">
                  Profile Picture
                </label>
                <ImageUpload
                  currentImage={form.profilePicture}
                  onImageChange={(imageData) => handleImageChange(imageData, 'profile')}
                  type="profile"
                />
              </div>
            </div>

            {/* Bio Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
                About You
              </h3>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Bio ({form.bio.length}/200)
                </label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Tell other racers about yourself, your racing style, favorite tracks, achievements..."
                  rows={4}
                  maxLength={200}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                />
                {errors.bio && <p className="text-sm text-red-400 font-medium">{errors.bio}</p>}
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
                Personal Information
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  name="fullName"
                  type="text"
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={form.fullName}
                  onChange={handleChange}
                  error={errors.fullName}
                  autoComplete="name"
                />

                <Input
                  name="phone"
                  type="tel"
                  label="Phone Number"
                  placeholder="Enter your phone number"
                  value={form.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  autoComplete="tel"
                />
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
                Address Information
              </h3>
              
              <Input
                name="address"
                type="text"
                label="Street Address"
                placeholder="Enter your street address"
                value={form.address}
                onChange={handleChange}
                error={errors.address}
                autoComplete="street-address"
              />
              
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  name="state"
                  type="text"
                  label="State"
                  placeholder="Enter your state"
                  value={form.state}
                  onChange={handleChange}
                  error={errors.state}
                  autoComplete="address-level1"
                />

                <Input
                  name="zipCode"
                  type="text"
                  label="ZIP Code"
                  placeholder="Enter your ZIP code"
                  value={form.zipCode}
                  onChange={handleChange}
                  error={errors.zipCode}
                  autoComplete="postal-code"
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
                Emergency Contact
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  name="emergencyName"
                  type="text"
                  label="Contact Name"
                  placeholder="Emergency contact name"
                  value={form.emergencyName}
                  onChange={handleChange}
                  error={errors.emergencyName}
                />

                <Input
                  name="emergencyPhone"
                  type="tel"
                  label="Contact Phone"
                  placeholder="Emergency contact phone"
                  value={form.emergencyPhone}
                  onChange={handleChange}
                  error={errors.emergencyPhone}
                />
              </div>
            </div>

            {/* Account Information (Read-only) */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
                Account Information
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">Email Address</label>
                  <div className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600/50 rounded-lg text-slate-400">
                    {user.email}
                  </div>
                  <p className="text-xs text-slate-500">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">Date of Birth</label>
                  <div className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600/50 rounded-lg text-slate-400">
                    {new Date(user.dob).toLocaleDateString()}
                  </div>
                  <p className="text-xs text-slate-500">Date of birth cannot be changed</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Social Accounts Tab */
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
              Connect Your Gaming & Social Accounts
            </h3>
            <p className="text-slate-400 text-sm">
              Link your gaming and social media accounts to showcase your online presence and connect with other racers.
            </p>

            {/* Steam */}
            <div className="bg-slate-700/30 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                    <span className="text-blue-400 font-bold text-sm">ST</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Steam</h4>
                    <p className="text-sm text-slate-400">Connect your Steam gaming profile</p>
                  </div>
                </div>
                {form.socialAccounts.steam?.connected ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => disconnectSocialAccount('steam')}
                    icon={Unlink}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => connectSocialAccount('steam')}
                    icon={Link}
                  >
                    Connect
                  </Button>
                )}
              </div>
              {!form.socialAccounts.steam?.connected && (
                <Input
                  type="text"
                  placeholder="Steam username"
                  value={form.socialAccounts.steam?.username || ''}
                  onChange={(e) => handleSocialAccountChange('steam', 'username', e.target.value)}
                />
              )}
              {form.socialAccounts.steam?.connected && (
                <div className="flex items-center space-x-2 text-sm text-green-400">
                  <span>✓ Connected as {form.socialAccounts.steam.username}</span>
                  {form.socialAccounts.steam.profileUrl && (
                    <a 
                      href={form.socialAccounts.steam.profileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Discord */}
            <div className="bg-slate-700/30 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-600/20 rounded-lg flex items-center justify-center">
                    <span className="text-indigo-400 font-bold text-sm">DC</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Discord</h4>
                    <p className="text-sm text-slate-400">Connect your Discord for community chat</p>
                  </div>
                </div>
                {form.socialAccounts.discord?.connected ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => disconnectSocialAccount('discord')}
                    icon={Unlink}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => connectSocialAccount('discord')}
                    icon={Link}
                  >
                    Connect
                  </Button>
                )}
              </div>
              {!form.socialAccounts.discord?.connected && (
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="text"
                    placeholder="Discord username"
                    value={form.socialAccounts.discord?.username || ''}
                    onChange={(e) => handleSocialAccountChange('discord', 'username', e.target.value)}
                  />
                  <Input
                    type="text"
                    placeholder="Discriminator (e.g., 1234)"
                    value={form.socialAccounts.discord?.discriminator || ''}
                    onChange={(e) => handleSocialAccountChange('discord', 'discriminator', e.target.value)}
                  />
                </div>
              )}
              {form.socialAccounts.discord?.connected && (
                <div className="text-sm text-green-400">
                  ✓ Connected as {form.socialAccounts.discord.username}#{form.socialAccounts.discord.discriminator}
                </div>
              )}
            </div>

            {/* Twitch */}
            <div className="bg-slate-700/30 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                    <span className="text-purple-400 font-bold text-sm">TW</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Twitch</h4>
                    <p className="text-sm text-slate-400">Link your streaming channel</p>
                  </div>
                </div>
                {form.socialAccounts.twitch?.connected ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => disconnectSocialAccount('twitch')}
                    icon={Unlink}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => connectSocialAccount('twitch')}
                    icon={Link}
                  >
                    Connect
                  </Button>
                )}
              </div>
              {!form.socialAccounts.twitch?.connected && (
                <Input
                  type="text"
                  placeholder="Twitch username"
                  value={form.socialAccounts.twitch?.username || ''}
                  onChange={(e) => handleSocialAccountChange('twitch', 'username', e.target.value)}
                />
              )}
              {form.socialAccounts.twitch?.connected && (
                <div className="flex items-center space-x-2 text-sm text-green-400">
                  <span>✓ Connected as {form.socialAccounts.twitch.username}</span>
                  {form.socialAccounts.twitch.profileUrl && (
                    <a 
                      href={form.socialAccounts.twitch.profileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* YouTube */}
            <div className="bg-slate-700/30 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center">
                    <span className="text-red-400 font-bold text-sm">YT</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">YouTube</h4>
                    <p className="text-sm text-slate-400">Share your racing content channel</p>
                  </div>
                </div>
                {form.socialAccounts.youtube?.connected ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => disconnectSocialAccount('youtube')}
                    icon={Unlink}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => connectSocialAccount('youtube')}
                    icon={Link}
                  >
                    Connect
                  </Button>
                )}
              </div>
              {!form.socialAccounts.youtube?.connected && (
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="text"
                    placeholder="Channel name"
                    value={form.socialAccounts.youtube?.channelName || ''}
                    onChange={(e) => handleSocialAccountChange('youtube', 'channelName', e.target.value)}
                  />
                  <Input
                    type="url"
                    placeholder="Channel URL"
                    value={form.socialAccounts.youtube?.channelUrl || ''}
                    onChange={(e) => handleSocialAccountChange('youtube', 'channelUrl', e.target.value)}
                  />
                </div>
              )}
              {form.socialAccounts.youtube?.connected && (
                <div className="flex items-center space-x-2 text-sm text-green-400">
                  <span>✓ Connected: {form.socialAccounts.youtube.channelName}</span>
                  {form.socialAccounts.youtube.channelUrl && (
                    <a 
                      href={form.socialAccounts.youtube.channelUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Twitter */}
            <div className="bg-slate-700/30 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-sky-600/20 rounded-lg flex items-center justify-center">
                    <span className="text-sky-400 font-bold text-sm">X</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Twitter / X</h4>
                    <p className="text-sm text-slate-400">Connect your Twitter profile</p>
                  </div>
                </div>
                {form.socialAccounts.twitter?.connected ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => disconnectSocialAccount('twitter')}
                    icon={Unlink}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => connectSocialAccount('twitter')}
                    icon={Link}
                  >
                    Connect
                  </Button>
                )}
              </div>
              {!form.socialAccounts.twitter?.connected && (
                <Input
                  type="text"
                  placeholder="Twitter username (without @)"
                  value={form.socialAccounts.twitter?.username || ''}
                  onChange={(e) => handleSocialAccountChange('twitter', 'username', e.target.value)}
                />
              )}
              {form.socialAccounts.twitter?.connected && (
                <div className="flex items-center space-x-2 text-sm text-green-400">
                  <span>✓ Connected as @{form.socialAccounts.twitter.username}</span>
                  {form.socialAccounts.twitter.profileUrl && (
                    <a 
                      href={form.socialAccounts.twitter.profileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Personal Website */}
            <div className="bg-slate-700/30 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                    <span className="text-green-400 font-bold text-sm">WEB</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Personal Website</h4>
                    <p className="text-sm text-slate-400">Link to your personal website or portfolio</p>
                  </div>
                </div>
                {form.socialAccounts.personalWebsite?.connected ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => disconnectSocialAccount('personalWebsite')}
                    icon={Unlink}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => connectSocialAccount('personalWebsite')}
                    icon={Link}
                  >
                    Connect
                  </Button>
                )}
              </div>
              {!form.socialAccounts.personalWebsite?.connected && (
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="text"
                    placeholder="Website title"
                    value={form.socialAccounts.personalWebsite?.title || ''}
                    onChange={(e) => handleSocialAccountChange('personalWebsite', 'title', e.target.value)}
                  />
                  <Input
                    type="url"
                    placeholder="https://yourwebsite.com"
                    value={form.socialAccounts.personalWebsite?.url || ''}
                    onChange={(e) => handleSocialAccountChange('personalWebsite', 'url', e.target.value)}
                    error={errors.personalWebsiteUrl}
                  />
                </div>
              )}
              {form.socialAccounts.personalWebsite?.connected && (
                <div className="flex items-center space-x-2 text-sm text-green-400">
                  <span>✓ Connected: {form.socialAccounts.personalWebsite.title}</span>
                  {form.socialAccounts.personalWebsite.url && (
                    <a 
                      href={form.socialAccounts.personalWebsite.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {Object.keys(errors).length > 0 && (
          <div className="flex items-center space-x-2 text-red-400 bg-red-500/10 p-3 rounded-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">Please fix the errors above</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button 
            type="submit" 
            size="lg" 
            className="flex-1"
            disabled={isLoading}
            icon={Save}
          >
            {isLoading ? 'Saving Changes...' : 'Save Changes'}
          </Button>
          
          <Button 
            type="button"
            variant="outline" 
            size="lg" 
            className="flex-1"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}