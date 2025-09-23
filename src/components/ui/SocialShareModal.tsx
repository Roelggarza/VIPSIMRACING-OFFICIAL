import React, { useState } from 'react';
import { Share2, Copy, Check, ExternalLink } from 'lucide-react';
import { socialPlatforms, shareToSocial, ShareData } from '../../utils/socialSharing';
import Button from './Button';
import Modal from './Modal';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareData: ShareData;
  title?: string;
}

export default function SocialShareModal({ 
  isOpen, 
  onClose, 
  shareData, 
  title = 'Share Content' 
}: SocialShareModalProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isSharing, setIsSharing] = useState<string | null>(null);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareData.url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
      alert('Failed to copy URL to clipboard');
    }
  };

  const handleSocialShare = async (platformId: string) => {
    const platform = socialPlatforms.find(p => p.id === platformId);
    if (!platform) return;

    setIsSharing(platformId);
    
    try {
      await shareToSocial(platform, shareData);
    } catch (error) {
      console.error('Sharing failed:', error);
      alert('Failed to share content. Please try again.');
    } finally {
      setTimeout(() => setIsSharing(null), 1000);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-6">
        {/* Preview */}
        <div className="bg-slate-700/30 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-white">{shareData.title}</h3>
          <p className="text-slate-300 text-sm">{shareData.description}</p>
          {shareData.imageUrl && (
            <img 
              src={shareData.imageUrl} 
              alt="Share preview"
              className="w-full h-32 object-cover rounded-lg"
            />
          )}
          <div className="flex items-center space-x-2">
            <code className="bg-slate-800 px-2 py-1 rounded text-xs text-green-400 flex-1 truncate">
              {shareData.url}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyUrl}
              icon={copiedUrl ? Check : Copy}
            >
              {copiedUrl ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>

        {/* Social Platforms */}
        <div className="space-y-3">
          <h4 className="font-semibold text-white">Share to:</h4>
          <div className="grid grid-cols-2 gap-3">
            {socialPlatforms.map((platform) => (
              <Button
                key={platform.id}
                variant="outline"
                onClick={() => handleSocialShare(platform.id)}
                disabled={isSharing === platform.id}
                className="h-12 justify-start space-x-3"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${platform.color}`}>
                  {platform.icon}
                </div>
                <span>{platform.name}</span>
                {isSharing === platform.id && (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin ml-auto" />
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Hashtags */}
        {shareData.hashtags && shareData.hashtags.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-white text-sm">Suggested Hashtags:</h4>
            <div className="flex flex-wrap gap-2">
              {shareData.hashtags.map((tag, index) => (
                <span 
                  key={index}
                  className="bg-slate-700/50 px-2 py-1 rounded text-xs text-slate-300 cursor-pointer hover:bg-slate-600/50 transition-colors"
                  onClick={() => navigator.clipboard.writeText(`#${tag}`)}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <p className="text-blue-300 text-sm">
            <strong>Tip:</strong> Click any platform to open a new window with pre-filled content. 
            For Instagram, the content will be copied to your clipboard for easy pasting.
          </p>
        </div>
      </div>
    </Modal>
  );
}