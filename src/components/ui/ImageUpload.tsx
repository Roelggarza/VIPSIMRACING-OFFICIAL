import React, { useRef, useState } from 'react';
import { Camera, Upload, User, X, Crop } from 'lucide-react';
import Button from './Button';

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
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

    setSelectedFile(file);
    setShowCropModal(true);
  };

  const processImage = (file: File, crop?: { x: number; y: number; width: number; height: number }) => {
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      
      if (crop && type === 'profile') {
        // For profile pictures, create a cropped circular version
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            const size = Math.min(crop.width, crop.height);
            canvas.width = size;
            canvas.height = size;
            
            // Create circular clip
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
            ctx.clip();
            
            // Draw cropped image
            ctx.drawImage(
              img,
              crop.x, crop.y, crop.width, crop.height,
              0, 0, size, size
            );
            
            const croppedResult = canvas.toDataURL('image/jpeg', 0.8);
            setPreviewImage(croppedResult);
            onImageChange(croppedResult);
          }
        };
        img.src = result;
      } else {
        // For banners or simple uploads, use as-is
        setPreviewImage(result);
        onImageChange(result);
      }
      
      setIsUploading(false);
      setShowCropModal(false);
    };
    
    reader.onerror = () => {
      alert('Error reading file');
      setIsUploading(false);
      setShowCropModal(false);
    };
    
    reader.readAsDataURL(file);
  };

  const handleCropConfirm = () => {
    if (selectedFile) {
      // For now, just process without crop - can be enhanced with a proper crop tool
      processImage(selectedFile);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
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
              onClick={(e) => {
                e.stopPropagation();
                removeImage();
              }}
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
          <Camera className="w-8 h-8 text-white" />
        </div>

        {/* Remove button */}
        {displayImage && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeImage();
            }}
            className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={triggerFileSelect}
          disabled={isUploading}
          icon={Upload}
        >
          {isUploading ? 'Uploading...' : displayImage ? 'Change Photo' : 'Add Photo'}
        </Button>
        
        {displayImage && (
          <Button
            variant="ghost"
            size="sm"
            onClick={removeImage}
            icon={X}
          >
            Remove
          </Button>
        )}
      </div>

      {/* Crop Modal */}
      {showCropModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-white mb-4">Adjust Image</h3>
            <p className="text-slate-300 text-sm mb-4">
              {type === 'profile' 
                ? 'Your image will be cropped to a circle for your profile picture.'
                : 'Adjust your banner image as needed.'
              }
            </p>
            <div className="flex space-x-3">
              <Button onClick={handleCropConfirm} disabled={isUploading}>
                {isUploading ? 'Processing...' : 'Confirm'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowCropModal(false);
                  setSelectedFile(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
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