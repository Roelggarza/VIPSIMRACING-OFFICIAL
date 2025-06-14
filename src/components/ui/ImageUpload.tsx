import React, { useRef, useState } from 'react';
import { Camera, User, X, Upload } from 'lucide-react';

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
    e.preventDefault();
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
          <div className="h-32 bg-gradient-to-r from-slate-700 via-slate-600 to-red-900/50 rounded-lg overflow-hidden">
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
                  <p className="text-slate-400 text-sm">Click upload to add banner</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Upload Button */}
          <button
            onClick={triggerFileSelect}
            className="absolute bottom-2 right-2 w-10 h-10 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors shadow-lg"
            disabled={isUploading}
          >
            <Upload className="w-5 h-5" />
          </button>
          
          {/* Remove Button */}
          {displayImage && (
            <button
              onClick={removeImage}
              className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors z-10"
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
      <div className="relative">
        {/* Profile Picture Circle */}
        <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-700/50 border-4 border-slate-600">
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
                <p className="text-slate-400 text-xs">No image</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Upload Button - Bottom Right Corner */}
        <button
          onClick={triggerFileSelect}
          disabled={isUploading}
          className="absolute bottom-0 right-0 w-10 h-10 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors shadow-lg border-2 border-slate-800"
        >
          {isUploading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Upload className="w-5 h-5" />
          )}
        </button>

        {/* Remove Button - Top Right Corner */}
        {displayImage && (
          <button
            onClick={removeImage}
            className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors z-10 border-2 border-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Loading state text */}
      {isUploading && (
        <p className="text-sm text-slate-400">Uploading image...</p>
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