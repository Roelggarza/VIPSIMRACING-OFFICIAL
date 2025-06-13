import React, { useState } from 'react';
import { Save, AlertCircle, CheckCircle, Upload, Image } from 'lucide-react';
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
  emergencyName: string;
  emergencyPhone: string;
  profilePicture: string;
  bannerImage: string;
  bio: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function ProfileEdit({ user, onSave, onCancel }: ProfileEditProps) {
  const [form, setForm] = useState<FormData>({
    fullName: user.fullName,
    phone: user.phone,
    emergencyName: user.emergencyName,
    emergencyPhone: user.emergencyPhone,
    profilePicture: user.profilePicture || '',
    bannerImage: user.bannerImage || '',
    bio: user.bio || '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
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
    if (!form.emergencyName.trim()) newErrors.emergencyName = 'Emergency contact name is required';
    if (!form.emergencyPhone.trim()) newErrors.emergencyPhone = 'Emergency contact phone is required';
    if (form.bio.length > 200) newErrors.bio = 'Bio must be 200 characters or less';

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
        emergencyName: form.emergencyName,
        emergencyPhone: form.emergencyPhone,
        profilePicture: form.profilePicture,
        bannerImage: form.bannerImage,
        bio: form.bio,
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
    <form onSubmit={handleSubmit} className="space-y-6">
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
          <div className="relative">
            <div className="h-32 bg-gradient-to-r from-slate-700 via-slate-600 to-red-900/50 rounded-lg overflow-hidden">
              {form.bannerImage ? (
                <img 
                  src={form.bannerImage} 
                  alt="Banner" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-slate-700 via-slate-600 to-red-900/50 flex items-center justify-center">
                  <Image className="w-8 h-8 text-slate-400" />
                </div>
              )}
            </div>
            <div className="absolute bottom-2 right-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      handleImageChange(e.target?.result as string, 'banner');
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="hidden"
                id="banner-upload"
              />
              <label
                htmlFor="banner-upload"
                className="bg-slate-800/80 hover:bg-slate-700/80 text-white px-3 py-1 rounded-lg text-sm cursor-pointer flex items-center space-x-1"
              >
                <Upload className="w-4 h-4" />
                <span>Change</span>
              </label>
            </div>
          </div>
        </div>

        {/* Profile Picture */}
        <div className="text-center">
          <label className="block text-sm font-medium text-slate-300 mb-4">
            Profile Picture
          </label>
          <ImageUpload
            currentImage={form.profilePicture}
            onImageChange={(imageData) => handleImageChange(imageData, 'profile')}
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
  );
}