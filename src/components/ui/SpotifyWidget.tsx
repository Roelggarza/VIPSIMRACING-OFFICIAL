import React, { useState } from 'react';
import { Music, Play, Pause, SkipForward, SkipBack, Volume2, ExternalLink, X } from 'lucide-react';
import Button from './Button';

interface SpotifyWidgetProps {
  spotifyData: {
    connected: boolean;
    currentTrack?: {
      name: string;
      artist: string;
      album: string;
      imageUrl: string;
      isPlaying: boolean;
      duration: number;
      progress: number;
    };
  };
  onClose?: () => void;
  compact?: boolean;
}

export default function SpotifyWidget({ spotifyData, onClose, compact = false }: SpotifyWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(!compact);

  if (!spotifyData.connected || !spotifyData.currentTrack) {
    return null;
  }

  const { currentTrack } = spotifyData;
  const progressPercent = (currentTrack.progress / currentTrack.duration) * 100;

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (compact && !isExpanded) {
    return (
      <div 
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-4 right-4 bg-green-500 hover:bg-green-600 rounded-full p-3 cursor-pointer transition-all duration-200 shadow-lg z-50"
      >
        <div className="flex items-center space-x-2">
          <Music className="w-5 h-5 text-white" />
          {currentTrack.isPlaying && (
            <div className="flex space-x-1">
              <div className="w-1 h-4 bg-white rounded animate-pulse"></div>
              <div className="w-1 h-4 bg-white rounded animate-pulse" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1 h-4 bg-white rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-2xl border border-slate-700/50 p-4 w-80 z-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <Music className="w-3 h-3 text-white" />
          </div>
          <span className="text-green-400 text-sm font-semibold">Spotify</span>
        </div>
        <div className="flex items-center space-x-2">
          {compact && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Track Info */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-700">
          <img 
            src={currentTrack.imageUrl} 
            alt={currentTrack.album}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-semibold text-sm truncate">{currentTrack.name}</h4>
          <p className="text-slate-400 text-xs truncate">{currentTrack.artist}</p>
          <p className="text-slate-500 text-xs truncate">{currentTrack.album}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="p-1"
          onClick={() => window.open('https://open.spotify.com', '_blank')}
        >
          <ExternalLink className="w-4 h-4" />
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>{formatTime(currentTrack.progress)}</span>
          <span>{formatTime(currentTrack.duration)}</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-1">
          <div 
            className="bg-green-500 h-1 rounded-full transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4">
        <Button variant="ghost" size="sm" className="p-2">
          <SkipBack className="w-4 h-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-3 bg-green-500 hover:bg-green-600 rounded-full"
        >
          {currentTrack.isPlaying ? (
            <Pause className="w-5 h-5 text-white" />
          ) : (
            <Play className="w-5 h-5 text-white ml-0.5" />
          )}
        </Button>
        
        <Button variant="ghost" size="sm" className="p-2">
          <SkipForward className="w-4 h-4" />
        </Button>
        
        <Button variant="ghost" size="sm" className="p-2">
          <Volume2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Now Playing Indicator */}
      {currentTrack.isPlaying && (
        <div className="flex items-center justify-center mt-3 space-x-1">
          <div className="w-1 h-3 bg-green-500 rounded animate-pulse"></div>
          <div className="w-1 h-4 bg-green-500 rounded animate-pulse" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-1 h-2 bg-green-500 rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-1 h-4 bg-green-500 rounded animate-pulse" style={{ animationDelay: '0.3s' }}></div>
          <div className="w-1 h-3 bg-green-500 rounded animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          <span className="text-green-400 text-xs ml-2">Now Playing</span>
        </div>
      )}
    </div>
  );
}