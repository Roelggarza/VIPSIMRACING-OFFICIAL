export interface ShareData {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  hashtags?: string[];
}

export interface SocialPlatform {
  id: string;
  name: string;
  icon: string;
  color: string;
  shareUrl: (data: ShareData) => string;
}

/**
 * Generate sharing URL for different social platforms
 */
export const socialPlatforms: SocialPlatform[] = [
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'FB',
    color: 'bg-blue-600',
    shareUrl: (data: ShareData) => {
      const params = new URLSearchParams({
        u: data.url,
        quote: `${data.title}\n\n${data.description}`
      });
      return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`;
    }
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    icon: 'X',
    color: 'bg-black',
    shareUrl: (data: ShareData) => {
      const hashtags = data.hashtags?.join(',') || 'VIPSimRacing,Racing,Motorsport';
      const text = `${data.title}\n\n${data.description}\n\n${data.url}`;
      const params = new URLSearchParams({
        text: text,
        hashtags: hashtags
      });
      return `https://twitter.com/intent/tweet?${params.toString()}`;
    }
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: 'IG',
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    shareUrl: (data: ShareData) => {
      // Instagram doesn't support direct URL sharing, so we'll copy to clipboard
      return `https://www.instagram.com/`;
    }
  },
  {
    id: 'truthsocial',
    name: 'Truth Social',
    icon: 'TS',
    color: 'bg-red-600',
    shareUrl: (data: ShareData) => {
      const text = `${data.title}\n\n${data.description}\n\n${data.url}`;
      const params = new URLSearchParams({
        text: text
      });
      return `https://truthsocial.com/share?${params.toString()}`;
    }
  }
];

/**
 * Share content to social platform
 * @param platform - Social platform to share to
 * @param data - Content data to share
 */
export const shareToSocial = async (platform: SocialPlatform, data: ShareData): Promise<void> => {
  const shareUrl = platform.shareUrl(data);
  
  if (platform.id === 'instagram') {
    // For Instagram, copy content to clipboard since they don't support direct URL sharing
    const shareText = `${data.title}\n\n${data.description}\n\nCheck it out: ${data.url}\n\n#VIPSimRacing #Racing #Motorsport`;
    
    try {
      await navigator.clipboard.writeText(shareText);
      alert('Content copied to clipboard! Open Instagram and paste to share.');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      alert('Please manually copy this content to share on Instagram:\n\n' + shareText);
    }
  } else {
    // Open sharing URL in new window
    const width = 600;
    const height = 400;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    
    window.open(
      shareUrl,
      'share-window',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  }
};

/**
 * Generate share data for community post
 * @param post - Community post to share
 * @param baseUrl - Base URL of the website
 * @returns ShareData - Formatted share data
 */
export const generatePostShareData = (post: any, baseUrl: string = window.location.origin): ShareData => {
  const postUrl = `${baseUrl}/community/post/${post.id}`;
  
  return {
    title: `Check out this racing post: ${post.title}`,
    description: post.description || 'Amazing racing content from the VIP SIM RACING community!',
    url: postUrl,
    imageUrl: post.mediaUrl,
    hashtags: ['VIPSimRacing', 'Racing', 'Motorsport', 'SimRacing', ...(post.tags || [])]
  };
};

/**
 * Generate share data for merch item
 * @param item - Merch item to share
 * @param baseUrl - Base URL of the website
 * @returns ShareData - Formatted share data
 */
export const generateMerchShareData = (item: any, baseUrl: string = window.location.origin): ShareData => {
  const merchUrl = `${baseUrl}/merch`;
  
  return {
    title: `Check out this VIP SIM RACING merch: ${item.name}`,
    description: `${item.description} Available for $${item.price}!`,
    url: merchUrl,
    imageUrl: item.image,
    hashtags: ['VIPSimRacing', 'Merch', 'Racing', 'Motorsport']
  };
};

/**
 * Generate share data for racing achievement
 * @param achievement - Achievement data
 * @param baseUrl - Base URL of the website
 * @returns ShareData - Formatted share data
 */
export const generateAchievementShareData = (achievement: any, baseUrl: string = window.location.origin): ShareData => {
  return {
    title: `New racing achievement unlocked!`,
    description: `Just achieved ${achievement.title} at VIP SIM RACING! ${achievement.description}`,
    url: baseUrl,
    hashtags: ['VIPSimRacing', 'Racing', 'Achievement', 'Motorsport', 'SimRacing']
  };
};