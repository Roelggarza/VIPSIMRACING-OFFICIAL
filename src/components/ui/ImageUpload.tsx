import React, { useRef, useState } from 'react';
import { Camera, Upload, User } from 'lucide-react';
import Button from './Button';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageData: string) => void;
  className?: string;
}

export default function ImageUpload({ currentImage, onImageChange, className = '' }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onImageChange(result);
      setIsUploading(false);
    };
    reader.onerror = () => {
      alert('Error reading file');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <div className="relative group">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-700/50 border-4 border-slate-600 group-hover:border-red-500 transition-colors duration-200">
          {currentImage ? (
            <img 
              src={currentImage} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-16 h-16 text-slate-400" />
            </div>
          )}
        </div>
        
        {/* Overlay */}
        <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <Camera className="w-8 h-8 text-white" />
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={triggerFileSelect}
        disabled={isUploading}
        icon={Upload}
      >
        {isUploading ? 'Uploading...' : 'Change Photo'}
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}