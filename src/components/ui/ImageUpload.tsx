import React, { useRef, useState, useCallback } from 'react';
import { Camera, User, X, Upload, RotateCw, ZoomIn, ZoomOut, Move, Check } from 'lucide-react';
import Button from './Button';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageData: string) => void;
  className?: string;
  type?: 'profile' | 'banner';
}

interface CropSettings {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export default function ImageUpload({ currentImage, onImageChange, className = '', type = 'profile' }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [showCropEditor, setShowCropEditor] = useState(false);
  const [cropSettings, setCropSettings] = useState<CropSettings>({
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size must be less than 10MB');
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      
      // Create image object for cropping
      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);
        setPreviewImage(result);
        setShowCropEditor(true);
        
        // Reset crop settings
        setCropSettings({
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0
        });
        
        setIsUploading(false);
      };
      img.src = result;
    };
    reader.onerror = () => {
      alert('Error reading file');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  }, []);

  const triggerFileSelect = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const removeImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPreviewImage(null);
    setOriginalImage(null);
    setShowCropEditor(false);
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - cropSettings.x, y: e.clientY - cropSettings.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    setCropSettings(prev => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const applyCrop = () => {
    if (!originalImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions based on type
    const targetWidth = type === 'profile' ? 200 : 400;
    const targetHeight = type === 'profile' ? 200 : 150;
    
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, targetWidth, targetHeight);

    // Save context
    ctx.save();

    // Apply transformations
    ctx.translate(targetWidth / 2, targetHeight / 2);
    ctx.rotate((cropSettings.rotation * Math.PI) / 180);
    ctx.scale(cropSettings.scale, cropSettings.scale);
    ctx.translate(-targetWidth / 2, -targetHeight / 2);

    // Calculate source dimensions to maintain aspect ratio
    const sourceAspect = originalImage.width / originalImage.height;
    const targetAspect = targetWidth / targetHeight;
    
    let sourceWidth, sourceHeight, sourceX, sourceY;
    
    if (sourceAspect > targetAspect) {
      // Image is wider than target
      sourceHeight = originalImage.height;
      sourceWidth = sourceHeight * targetAspect;
      sourceX = (originalImage.width - sourceWidth) / 2 + cropSettings.x;
      sourceY = cropSettings.y;
    } else {
      // Image is taller than target
      sourceWidth = originalImage.width;
      sourceHeight = sourceWidth / targetAspect;
      sourceX = cropSettings.x;
      sourceY = (originalImage.height - sourceHeight) / 2 + cropSettings.y;
    }

    // Draw the cropped image
    ctx.drawImage(
      originalImage,
      Math.max(0, sourceX),
      Math.max(0, sourceY),
      Math.min(sourceWidth, originalImage.width - Math.max(0, sourceX)),
      Math.min(sourceHeight, originalImage.height - Math.max(0, sourceY)),
      0,
      0,
      targetWidth,
      targetHeight
    );

    // Restore context
    ctx.restore();

    // Convert to data URL
    const croppedImageData = canvas.toDataURL('image/jpeg', 0.9);
    onImageChange(croppedImageData);
    setShowCropEditor(false);
    setPreviewImage(croppedImageData);
  };

  const displayImage = previewImage || currentImage;

  if (showCropEditor && originalImage) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-4">Crop & Format Image</h3>
          
          {/* Preview Area */}
          <div className="relative bg-slate-700 rounded-lg overflow-hidden mb-4" style={{ height: type === 'profile' ? '200px' : '150px' }}>
            <div
              className="absolute inset-0 cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <img
                src={previewImage || ''}
                alt="Crop preview"
                className="absolute"
                style={{
                  transform: `translate(${cropSettings.x}px, ${cropSettings.y}px) scale(${cropSettings.scale}) rotate(${cropSettings.rotation}deg)`,
                  transformOrigin: 'center center'
                }}
              />
            </div>
            
            {/* Crop overlay */}
            <div className="absolute inset-0 border-2 border-red-500 pointer-events-none">
              <div className="absolute inset-0 bg-black bg-opacity-50"></div>
              <div 
                className="absolute bg-transparent border-2 border-white"
                style={{
                  width: type === 'profile' ? '200px' : '100%',
                  height: type === 'profile' ? '200px' : '100%',
                  left: type === 'profile' ? '50%' : '0',
                  top: type === 'profile' ? '50%' : '0',
                  transform: type === 'profile' ? 'translate(-50%, -50%)' : 'none'
                }}
              ></div>
            </div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Scale</label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={cropSettings.scale}
                onChange={(e) => setCropSettings(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Rotation</label>
              <input
                type="range"
                min="-180"
                max="180"
                step="5"
                value={cropSettings.rotation}
                onChange={(e) => setCropSettings(prev => ({ ...prev, rotation: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button onClick={applyCrop} icon={Check}>
              Apply Crop
            </Button>
            <Button variant="outline" onClick={() => setShowCropEditor(false)}>
              Cancel
            </Button>
            <Button variant="ghost" onClick={() => setCropSettings({ x: 0, y: 0, scale: 1, rotation: 0 })}>
              Reset
            </Button>
          </div>
        </div>

        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

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
            type="button"
            onClick={triggerFileSelect}
            className="absolute bottom-2 right-2 w-10 h-10 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors shadow-lg"
            disabled={isUploading}
          >
            {isUploading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Upload className="w-5 h-5" />
            )}
          </button>
          
          {/* Remove Button */}
          {displayImage && (
            <button
              type="button"
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
          type="button"
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
            type="button"
            onClick={removeImage}
            className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors z-10 border-2 border-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Loading state text */}
      {isUploading && (
        <p className="text-sm text-slate-400">Processing image...</p>
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