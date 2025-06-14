import React, { useRef, useState } from 'react';
import { Camera, User, X } from 'lucide-react';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageData: string) => void;
  className?: string;
  type?: 'profile' | 'banner';
}

export default function ImageUpload({ currentImage, onImageChange, className = '', type = 'profile' }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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
      setPreviewImage(result);
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

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewImage(null);
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayImage = previewImage || currentImage;

  if (type === 'banner') {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="relative">
          <div className="h-32 bg-gradient-to-r from-slate-700 via-slate-600 to-red-900/50 rounded-lg overflow-hidden group cursor-pointer" onClick={triggerFileSelect}>
            {displayImage ? (
              <img 
                src={displayImage} 
                alt="Banner" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-slate-700 via-slate-600 to-red-900/50 flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">Click to add banner</p>
                </div>
              </div>
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <div className="text-center">
                <Camera className="w-8 h-8 text-white mx-auto mb-2" />
                <p className="text-white text-sm">{displayImage ? 'Change Banner' : 'Add Banner'}</p>
              </div>
            </div>
          </div>
          
          {displayImage && (
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

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

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <div className="relative group">
        <div 
          className="w-32 h-32 rounded-full overflow-hidden bg-slate-700/50 border-4 border-slate-600 group-hover:border-red-500 transition-colors duration-200 cursor-pointer"
          onClick={triggerFileSelect}
        >
          {displayImage ? (
            <img 
              src={displayImage} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <User className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                <p className="text-slate-400 text-xs">Click to add</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Overlay */}
        <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer">
          <div className="text-center">
            <Camera className="w-8 h-8 text-white mx-auto mb-1" />
            <p className="text-white text-xs">{displayImage ? 'Change' : 'Upload'}</p>
          </div>
        </div>

        {/* Remove button */}
        {displayImage && (
          <button
            onClick={removeImage}
            className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Loading state */}
      {isUploading && (
        <p className="text-sm text-slate-400">Uploading...</p>
      )}

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