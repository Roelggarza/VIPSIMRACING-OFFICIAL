import React from 'react';
import { Music, Headphones, Play, Pause } from 'lucide-react';

interface StatusBubbleProps {
  status: 'online' | 'away' | 'busy' | 'offline';
  size?: 'sm' | 'md' | 'lg';
  showSpotify?: boolean;
  spotifyData?: {
    connected: boolean;
    currentTrack?: {
      name: string;
      artist: string;
      isPlaying: boolean;
    };
  };
  className?: string;
}

export default function StatusBubble({ 
  status, 
  size = 'md', 
  showSpotify = false, 
  spotifyData,
  className = '' 
}: StatusBubbleProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'busy':
        return 'bg-red-500';
      case 'offline':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-3 h-3';
      case 'md':
        return 'w-4 h-4';
      case 'lg':
        return 'w-5 h-5';
      default:
        return 'w-4 h-4';
    }
  };

  const getSpotifyIcon = () => {
    if (!spotifyData?.connected || !spotifyData?.currentTrack) {
      return <Headphones className="w-2 h-2 text-white" />;
    }
    
    return spotifyData.currentTrack.isPlaying ? 
      <Play className="w-2 h-2 text-white" /> : 
      <Pause className="w-2 h-2 text-white" />;
  };

  if (showSpotify && spotifyData?.connected && spotifyData?.currentTrack) {
    return (
      <div className={`relative ${className}`}>
        {/* Main status bubble */}
        <div className={`${getSizeClasses()} ${getStatusColor()} rounded-full border-2 border-white`} />
        
        {/* Spotify indicator */}
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white flex items-center justify-center">
          <Music className="w-1.5 h-1.5 text-white" />
        </div>
      </div>
    );
  }

  return (
    <div className={`${getSizeClasses()} ${getStatusColor()} rounded-full border-2 border-white ${className}`} />
  );
}