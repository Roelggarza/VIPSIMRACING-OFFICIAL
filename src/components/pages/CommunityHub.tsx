import React, { useState, useEffect } from 'react';
import { Globe, Image, Heart, MessageCircle, Share2, User, Crown, Calendar, Trophy, Video, Play, Send, Upload, Tag, Plus, Type, Camera, X, Reply, ThumbsUp, MoreHorizontal, Facebook, Twitter, Instagram, ExternalLink, Clipboard, Flag, AlertTriangle } from 'lucide-react';
import { getUsers, User as UserType, getCommunityPosts, CommunityPost, likeCommunityPost, addCommentToCommunityPost, addReplyToComment, likeComment, shareCommunityPost, addCommunityPost, Comment, reportPost } from '../../utils/userStorage';
import Card, { CardHeader, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import AIChat from '../ui/AIChat';

interface CommunityHubProps {
  currentUser: UserType;
}

export default function CommunityHub({ currentUser }: CommunityHubProps) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [filter, setFilter] = useState<'all' | 'following' | 'vip'>('all');
  const [commentTexts, setCommentTexts] = useState<{[key: string]: string}>({});
  const [replyTexts, setReplyTexts] = useState<{[key: string]: string}>({});
  const [showReplies, setShowReplies] = useState<{[key: string]: boolean}>({});
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [selectedPostForShare, setSelectedPostForShare] = useState<CommunityPost | null>(null);
  const [selectedPostForReport, setSelectedPostForReport] = useState<CommunityPost | null>(null);
  const [reportReason, setReportReason] = useState<'spam' | 'inappropriate' | 'harassment' | 'copyright' | 'other'>('spam');
  const [reportDescription, setReportDescription] = useState('');
  const [newPost, setNewPost] = useState({
    type: 'screenshot' as 'screenshot' | 'video' | 'lap_record' | 'highlight',
    title: '',
    description: '',
    mediaUrl: '',
    game: '',
    track: '',
    lapTime: '',
    achievement: '',
    tags: '',
    isPublic: true
  });
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showPasteHint, setShowPasteHint] = useState(false);

  useEffect(() => {
    setPosts(getCommunityPosts());
    setUsers(getUsers());
  }, []);

  const filteredPosts = posts.filter(post => {
    // Hide reported/hidden posts for non-admins
    if (post.isHidden && !currentUser.isAdmin) {
      return false;
    }
    
    if (filter === 'vip') {
      const user = users.find(u => u.email === post.userId);
      return user?.vipMembership?.active;
    }
    return post.isPublic;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getUserByEmail = (email: string) => {
    return users.find(u => u.email === email);
  };

  const refreshPosts = () => {
    setPosts(getCommunityPosts());
  };

  const handleLike = (postId: string) => {
    likeCommunityPost(postId, currentUser.email);
    refreshPosts();
  };

  const handleComment = (postId: string) => {
    const commentText = commentTexts[postId]?.trim();
    if (!commentText) return;

    try {
      addCommentToCommunityPost(postId, {
        userId: currentUser.email,
        userName: currentUser.fullName,
        userAvatar: currentUser.profilePicture,
        text: commentText
      });

      setCommentTexts(prev => ({ ...prev, [postId]: '' }));
      refreshPosts();
    } catch (error) {
      alert('Failed to add comment. Please try again.');
    }
  };

  const handleReply = (postId: string, commentId: string) => {
    const replyKey = `${postId}-${commentId}`;
    const replyText = replyTexts[replyKey]?.trim();
    if (!replyText) return;

    try {
      addReplyToComment(postId, commentId, {
        userId: currentUser.email,
        userName: currentUser.fullName,
        userAvatar: currentUser.profilePicture,
        text: replyText
      });

      setReplyTexts(prev => ({ ...prev, [replyKey]: '' }));
      refreshPosts();
    } catch (error) {
      alert('Failed to add reply. Please try again.');
    }
  };

  const handleLikeComment = (postId: string, commentId: string) => {
    likeComment(postId, commentId, currentUser.email);
    refreshPosts();
  };

  const handleShare = (post: CommunityPost) => {
    setSelectedPostForShare(post);
    setShowShareModal(true);
  };

  const handleReport = (post: CommunityPost) => {
    setSelectedPostForReport(post);
    setShowReportModal(true);
  };

  const handleSubmitReport = () => {
    if (!selectedPostForReport || !reportDescription.trim()) {
      alert('Please provide a description for your report.');
      return;
    }

    try {
      reportPost(selectedPostForReport.id, currentUser.email, reportReason, reportDescription);
      alert('Thank you for your report. Our moderation team will review it shortly.');
      setShowReportModal(false);
      setSelectedPostForReport(null);
      setReportDescription('');
      setReportReason('spam');
    } catch (error: any) {
      alert(error.message || 'Failed to submit report. Please try again.');
    }
  };

  const handleInternalShare = (postId: string) => {
    shareCommunityPost(postId, currentUser.email);
    refreshPosts();
    setShowShareModal(false);
    alert('Post shared to your timeline!');
  };

  const generateShareUrl = (post: CommunityPost) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/community/post/${post.id}`;
  };

  const generateShareText = (post: CommunityPost) => {
    const user = getUserByEmail(post.userId);
    let text = `Check out this amazing racing post by ${user?.fullName || 'a racer'}!\n\n`;
    text += `"${post.title}"\n`;
    if (post.description) {
      text += `${post.description.substring(0, 100)}${post.description.length > 100 ? '...' : ''}\n`;
    }
    if (post.track) text += `🏁 Track: ${post.track}\n`;
    if (post.lapTime) text += `⏱️ Lap Time: ${post.lapTime}\n`;
    if (post.achievement) text += `🏆 Achievement: ${post.achievement}\n`;
    text += `\n#VIPEdgeRacing #SimRacing`;
    return text;
  };

  const shareToFacebook = (post: CommunityPost) => {
    const url = generateShareUrl(post);
    const text = generateShareText(post);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
    handleInternalShare(post.id);
  };

  const shareToTwitter = (post: CommunityPost) => {
    const url = generateShareUrl(post);
    const text = generateShareText(post);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
    handleInternalShare(post.id);
  };

  const shareToInstagram = (post: CommunityPost) => {
    // Instagram doesn't support direct URL sharing, so we'll copy the content to clipboard
    const text = generateShareText(post);
    const url = generateShareUrl(post);
    const fullText = `${text}\n\nView full post: ${url}`;
    
    navigator.clipboard.writeText(fullText).then(() => {
      alert('Post content copied to clipboard! You can now paste it in Instagram.');
      // Open Instagram in a new tab
      window.open('https://www.instagram.com/', '_blank');
      handleInternalShare(post.id);
    }).catch(() => {
      alert('Unable to copy to clipboard. Please manually copy the post content.');
    });
  };

  const handleRequestScreenShare = () => {
    setIsRequestingScreenShare(true);
    
    // Simulate request submission
    setTimeout(() => {
      const newRequest = {
        id: Date.now().toString(),
        userId: currentUser.email,
        userName: currentUser.fullName,
        timestamp: new Date().toISOString(),
        status: 'pending',
        simulator: Math.floor(Math.random() * 8) + 1
      };
      
      const requests = JSON.parse(localStorage.getItem('screen_share_requests') || '[]');
      requests.push(newRequest);
      localStorage.setItem('screen_share_requests', JSON.stringify(requests));
      
      setScreenShareRequests(requests);
      setIsRequestingScreenShare(false);
      alert('Screen share request submitted! An admin will review and approve it shortly.');
    }, 1000);
  };

  useEffect(() => {
    const requests = JSON.parse(localStorage.getItem('screen_share_requests') || '[]');
    setScreenShareRequests(requests);
  }, []);

  const shareViaWebAPI = async (post: CommunityPost) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: generateShareText(post),
          url: generateShareUrl(post)
        });
        handleInternalShare(post.id);
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: copy to clipboard
      const text = generateShareText(post);
      const url = generateShareUrl(post);
      const fullText = `${text}\n\nView full post: ${url}`;
      
      navigator.clipboard.writeText(fullText).then(() => {
        alert('Post content copied to clipboard!');
        handleInternalShare(post.id);
      }).catch(() => {
        alert('Unable to copy to clipboard.');
      });
    }
  };

  const toggleReplies = (commentId: string) => {
    setShowReplies(prev => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const handleCreatePost = () => {
    if (!newPost.title.trim() && !newPost.description.trim()) {
      alert('Please add some content to your post');
      return;
    }

    try {
      const tagsArray = newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

      addCommunityPost({
        userId: currentUser.email,
        type: newPost.type,
        title: newPost.title || 'Racing Update',
        description: newPost.description,
        mediaUrl: newPost.mediaUrl,
        thumbnailUrl: newPost.type === 'video' ? newPost.mediaUrl : undefined,
        game: newPost.game,
        track: newPost.track,
        lapTime: newPost.lapTime,
        achievement: newPost.achievement,
        tags: tagsArray,
        isPublic: newPost.isPublic
      });

      refreshPosts();
      setShowCreatePost(false);
      setNewPost({
        type: 'screenshot',
        title: '',
        description: '',
        mediaUrl: '',
        game: '',
        track: '',
        lapTime: '',
        achievement: '',
        tags: '',
        isPublic: true
      });
    } catch (error) {
      alert('Failed to create post. Please check your content and try again.');
    }
  };

  const handleImageUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setNewPost(prev => ({ ...prev, mediaUrl: result }));
      setIsUploading(false);
    };
    reader.onerror = () => {
      alert('Error reading file');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      // Check if the item is an image
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          handleImageUpload(file);
          setShowPasteHint(false);
          return;
        }
      }
    }
  };

  const handleTextAreaFocus = () => {
    setShowPasteHint(true);
    // Hide hint after 3 seconds
    setTimeout(() => setShowPasteHint(false), 3000);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleImageUpload(files[0]);
    }
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'lap_record':
        return <Trophy className="w-4 h-4" />;
      case 'highlight':
        return <Play className="w-4 h-4" />;
      default:
        return <Image className="w-4 h-4" />;
    }
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'text-purple-400 bg-purple-500/20';
      case 'lap_record':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'highlight':
        return 'text-green-400 bg-green-500/20';
      default:
        return 'text-blue-400 bg-blue-500/20';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const renderComment = (comment: Comment, postId: string, isReply: boolean = false) => {
    const replyKey = `${postId}-${comment.id}`;
    const isLiked = comment.likedBy.includes(currentUser.email);
    const hasReplies = comment.replies && comment.replies.length > 0;
    const showingReplies = showReplies[comment.id];

    return (
      <div key={comment.id} className={`${isReply ? 'ml-8 border-l-2 border-slate-700 pl-4' : ''}`}>
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-600/50 flex-shrink-0">
            {comment.userAvatar ? (
              <img 
                src={comment.userAvatar} 
                alt="Commenter" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-4 h-4 text-slate-400" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="bg-slate-700/30 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <h4 className={`font-semibold ${comment.read ? 'text-slate-300' : 'text-white'} text-sm`}>
                  {comment.userName}
                </h4>
                <p className="text-xs text-slate-500">{formatTimeAgo(comment.createdAt)}</p>
              </div>
              <p className={`text-sm mt-1 ${comment.read ? 'text-slate-400' : 'text-slate-300'}`}>
                {comment.text}
              </p>
            </div>
            
            {/* Comment Actions */}
            <div className="flex items-center space-x-4 mt-2 text-xs">
              <button
                onClick={() => handleLikeComment(postId, comment.id)}
                className={`flex items-center space-x-1 hover:text-red-400 transition-colors ${
                  isLiked ? 'text-red-400' : 'text-slate-500'
                }`}
              >
                <ThumbsUp className="w-3 h-3" />
                <span>{comment.likes > 0 ? comment.likes : 'Like'}</span>
              </button>
              
              {!isReply && (
                <button
                  onClick={() => {
                    const replyInput = document.getElementById(`reply-${comment.id}`);
                    if (replyInput) replyInput.focus();
                  }}
                  className="flex items-center space-x-1 text-slate-500 hover:text-blue-400 transition-colors"
                >
                  <Reply className="w-3 h-3" />
                  <span>Reply</span>
                </button>
              )}
              
              {hasReplies && (
                <button
                  onClick={() => toggleReplies(comment.id)}
                  className="flex items-center space-x-1 text-slate-500 hover:text-blue-400 transition-colors"
                >
                  <MessageCircle className="w-3 h-3" />
                  <span>
                    {showingReplies ? 'Hide' : 'Show'} {comment.replies!.length} {comment.replies!.length === 1 ? 'reply' : 'replies'}
                  </span>
                </button>
              )}
            </div>

            {/* Reply Input */}
            {!isReply && (
              <div className="mt-3 flex space-x-2">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-600/50 flex-shrink-0">
                  {currentUser.profilePicture ? (
                    <img 
                      src={currentUser.profilePicture} 
                      alt="Your avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-3 h-3 text-slate-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 flex space-x-2">
                  <Input
                    id={`reply-${comment.id}`}
                    placeholder="Write a reply..."
                    value={replyTexts[replyKey] || ''}
                    onChange={(e) => setReplyTexts(prev => ({ ...prev, [replyKey]: e.target.value }))}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleReply(postId, comment.id);
                      }
                    }}
                    className="text-sm"
                  />
                  <Button 
                    size="sm" 
                    onClick={() => handleReply(postId, comment.id)}
                    disabled={!replyTexts[replyKey]?.trim()}
                    className="px-3"
                  >
                    <Send className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}

            {/* Replies */}
            {hasReplies && showingReplies && (
              <div className="mt-4 space-y-3">
                {comment.replies!.map((reply) => renderComment(reply, postId, true))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-bold text-white">VIP SIM RACING Community</h2>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={filter === 'all' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All Posts
              </Button>
              <Button
                variant={filter === 'vip' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setFilter('vip')}
                icon={Crown}
              >
                VIP Only
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAIChat(true)}
                icon={MessageCircle}
              >
                AI Support
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300">
            Share your racing moments, lap records, and highlights with the community! 
            Need help? Use our AI support chat for instant assistance.
          </p>
        </CardContent>
      </Card>

      {/* Create Post Section - Facebook Style */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-600/50">
              {currentUser.profilePicture ? (
                <img 
                  src={currentUser.profilePicture} 
                  alt="Your profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
              )}
            </div>
            <button
              onClick={() => setShowCreatePost(true)}
              className="flex-1 bg-slate-700/50 hover:bg-slate-700/70 rounded-full px-4 py-3 text-left text-slate-400 transition-colors"
            >
              What's your latest racing achievement, {currentUser.fullName.split(' ')[0]}?
            </button>
          </div>
          
          <div className="flex items-center justify-between pt-3 border-t border-slate-700">
            <button
              onClick={() => setShowCreatePost(true)}
              className="flex items-center space-x-2 text-slate-400 hover:text-red-400 transition-colors px-4 py-2 rounded-lg hover:bg-slate-700/30"
            >
              <Camera className="w-5 h-5" />
              <span className="text-sm font-medium">Photo/Video</span>
            </button>
            <button
              onClick={() => setShowCreatePost(true)}
              className="flex items-center space-x-2 text-slate-400 hover:text-yellow-400 transition-colors px-4 py-2 rounded-lg hover:bg-slate-700/30"
            >
              <Trophy className="w-5 h-5" />
              <span className="text-sm font-medium">Achievement</span>
            </button>
            <button
              onClick={() => setShowCreatePost(true)}
              className="flex items-center space-x-2 text-slate-400 hover:text-blue-400 transition-colors px-4 py-2 rounded-lg hover:bg-slate-700/30"
            >
              <Tag className="w-5 h-5" />
              <span className="text-sm font-medium">Lap Record</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-6">
        {filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Globe className="w-12 h-12 mx-auto mb-4 text-slate-400 opacity-50" />
              <p className="text-slate-400">No posts shared yet.</p>
              <p className="text-sm text-slate-500 mt-2">
                Be the first to share your racing achievements!
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map((post) => {
            const user = getUserByEmail(post.userId);
            if (!user) return null;

            const isLiked = post.likedBy.includes(currentUser.email);
            const isShared = post.sharedBy.includes(currentUser.email);
            const isVip = user.vipMembership?.active && new Date(user.vipMembership.expiryDate) > new Date();
            const isReported = post.reportedBy?.includes(currentUser.email);

            return (
              <Card key={post.id}>
                <CardContent className="p-0">
                  {/* User Header */}
                  <div className="p-4 border-b border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-600/50">
                          {user.profilePicture ? (
                            <img 
                              src={user.profilePicture} 
                              alt="Profile" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="w-6 h-6 text-slate-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-white">{user.fullName}</h4>
                            {isVip && (
                              <div className="bg-red-500/20 px-2 py-1 rounded-full">
                                <span className="text-red-300 text-xs font-bold flex items-center">
                                  <Crown className="w-3 h-3 mr-1" />
                                  VIP
                                </span>
                              </div>
                            )}
                            <div className={`px-2 py-1 rounded-full flex items-center space-x-1 ${getPostTypeColor(post.type)}`}>
                              {getPostTypeIcon(post.type)}
                              <span className="text-xs font-bold capitalize">{post.type.replace('_', ' ')}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-slate-400">
                            <Calendar className="w-3 h-3" />
                            <span>{formatTimeAgo(post.createdAt)}</span>
                            {post.game && (
                              <>
                                <span>•</span>
                                <span>{post.game}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="relative">
                        <Button variant="ghost" size="sm" icon={MoreHorizontal}>
                          <span className="sr-only">More options</span>
                        </Button>
                        {/* Dropdown menu would go here */}
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-white mb-2">{post.title}</h3>
                    {post.description && (
                      <p className="text-slate-300 mb-4">{post.description}</p>
                    )}
                    
                    {/* Hidden post warning for admins */}
                    {post.isHidden && currentUser.isAdmin && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
                        <div className="flex items-center space-x-2 text-red-400">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-sm font-semibold">This post is hidden due to reports</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Media */}
                  {post.mediaUrl && (
                    <div className="relative">
                      {post.type === 'video' ? (
                        <div className="relative">
                          <img 
                            src={post.thumbnailUrl || post.mediaUrl} 
                            alt="Video thumbnail" 
                            className="w-full h-auto max-h-96 object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <div className="w-16 h-16 bg-red-500/80 rounded-full flex items-center justify-center">
                              <Play className="w-8 h-8 text-white ml-1" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <img 
                          src={post.mediaUrl} 
                          alt="Racing content" 
                          className="w-full h-auto max-h-96 object-cover"
                        />
                      )}
                      
                      {post.achievement && (
                        <div className="absolute top-4 left-4 bg-yellow-500/20 backdrop-blur-sm px-3 py-1 rounded-full border border-yellow-500/30">
                          <span className="text-yellow-300 text-sm font-bold flex items-center">
                            <Trophy className="w-3 h-3 mr-1" />
                            {post.achievement}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Post Details */}
                  {(post.track || post.lapTime || post.tags?.length) && (
                    <div className="p-4 border-b border-slate-700/50 bg-slate-700/20">
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        {post.track && (
                          <div className="flex items-center space-x-1 text-blue-400">
                            <span>📍</span>
                            <span>{post.track}</span>
                          </div>
                        )}
                        {post.lapTime && (
                          <div className="flex items-center space-x-1 text-green-400">
                            <span>⏱️</span>
                            <span>{post.lapTime}</span>
                          </div>
                        )}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex items-center space-x-2">
                            <Tag className="w-3 h-3 text-slate-400" />
                            <div className="flex flex-wrap gap-1">
                              {post.tags.map((tag, index) => (
                                <span key={index} className="bg-slate-600/50 px-2 py-1 rounded text-xs text-slate-300">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(post.id)}
                          className={isLiked ? 'text-red-500' : ''}
                          icon={Heart}
                        >
                          {post.likes || 0}
                        </Button>
                        <Button variant="ghost" size="sm" icon={MessageCircle}>
                          {post.comments?.length || 0}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          icon={Share2}
                          className={isShared ? 'text-blue-500' : ''}
                          onClick={() => handleShare(post)}
                        >
                          {post.shares || 0}
                        </Button>
                        {post.userId !== currentUser.email && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            icon={Flag}
                            className={isReported ? 'text-red-500' : 'text-slate-500'}
                            onClick={() => handleReport(post)}
                            disabled={isReported}
                          >
                            {isReported ? 'Reported' : 'Report'}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Comments */}
                    {post.comments && post.comments.length > 0 && (
                      <div className="space-y-4 mb-4">
                        {post.comments.map((comment) => renderComment(comment, post.id))}
                      </div>
                    )}

                    {/* Add Comment */}
                    <div className="flex space-x-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-600/50 flex-shrink-0">
                        {currentUser.profilePicture ? (
                          <img 
                            src={currentUser.profilePicture} 
                            alt="Your avatar" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-4 h-4 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 flex space-x-2">
                        <Input
                          placeholder="Add a comment..."
                          value={commentTexts[post.id] || ''}
                          onChange={(e) => setCommentTexts(prev => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleComment(post.id);
                            }
                          }}
                          className="flex-1"
                        />
                        <Button 
                          size="sm" 
                          onClick={() => handleComment(post.id)}
                          disabled={!commentTexts[post.id]?.trim()}
                          icon={Send}
                        >
                          Post
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => {
          setShowShareModal(false);
          setSelectedPostForShare(null);
        }}
        title="Share Post"
      >
        {selectedPostForShare && (
          <div className="space-y-4">
            {/* Post Preview */}
            <div className="bg-slate-700/30 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">{selectedPostForShare.title}</h4>
              {selectedPostForShare.description && (
                <p className="text-slate-300 text-sm mb-2">{selectedPostForShare.description.substring(0, 100)}...</p>
              )}
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                {selectedPostForShare.track && <span>🏁 {selectedPostForShare.track}</span>}
                {selectedPostForShare.lapTime && <span>⏱️ {selectedPostForShare.lapTime}</span>}
              </div>
            </div>

            {/* Share Options */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Share to Social Media</h3>
              
              <div className="grid grid-cols-1 gap-3">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-blue-600/10 hover:bg-blue-600/20 border-blue-600/30"
                  onClick={() => shareToFacebook(selectedPostForShare)}
                >
                  <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center mr-3">
                    <span className="text-white text-xs font-bold">f</span>
                  </div>
                  Share to Facebook
                  <ExternalLink className="w-4 h-4 ml-auto" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/30"
                  onClick={() => shareToTwitter(selectedPostForShare)}
                >
                  <div className="w-6 h-6 bg-sky-500 rounded flex items-center justify-center mr-3">
                    <span className="text-white text-xs font-bold">𝕏</span>
                  </div>
                  Share to X (Twitter)
                  <ExternalLink className="w-4 h-4 ml-auto" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border-purple-500/30"
                  onClick={() => shareToInstagram(selectedPostForShare)}
                >
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded flex items-center justify-center mr-3">
                    <span className="text-white text-xs font-bold">📷</span>
                  </div>
                  Copy for Instagram
                  <ExternalLink className="w-4 h-4 ml-auto" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => shareViaWebAPI(selectedPostForShare)}
                >
                  <Share2 className="w-5 h-5 mr-3" />
                  {navigator.share ? 'Share via Device' : 'Copy Link'}
                </Button>
              </div>

              <div className="border-t border-slate-700 pt-3">
                <h4 className="text-sm font-semibold text-white mb-2">Share within VIP Edge</h4>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => handleInternalShare(selectedPostForShare.id)}
                >
                  Share to Your Timeline
                </Button>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <p className="text-sm text-blue-300">
                <strong>Note:</strong> External sharing opens the respective social media platform. 
                Instagram requires manual posting as they don't support direct URL sharing.
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Report Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => {
          setShowReportModal(false);
          setSelectedPostForReport(null);
          setReportDescription('');
          setReportReason('spam');
        }}
        title="Report Content"
      >
        {selectedPostForReport && (
          <div className="space-y-4">
            {/* Post Preview */}
            <div className="bg-slate-700/30 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">Reporting: {selectedPostForReport.title}</h4>
              <p className="text-slate-400 text-sm">
                This will be sent to our moderation team for review.
              </p>
            </div>

            {/* Report Reason */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Reason for Report</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value as any)}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="spam">Spam</option>
                <option value="inappropriate">Inappropriate Content</option>
                <option value="harassment">Harassment or Bullying</option>
                <option value="copyright">Copyright Violation</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Report Description */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Please provide details about why you're reporting this content..."
                rows={4}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button 
                onClick={handleSubmitReport}
                disabled={!reportDescription.trim()}
                icon={Flag}
              >
                Submit Report
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setShowReportModal(false);
                  setSelectedPostForReport(null);
                  setReportDescription('');
                  setReportReason('spam');
                }}
              >
                Cancel
              </Button>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-sm text-red-300">
                <strong>Note:</strong> False reports may result in restrictions on your account. 
                Please only report content that genuinely violates our community guidelines.
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Post Modal - Facebook Style with Paste Support */}
      <Modal
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        title="Create Post"
      >
        <div className="space-y-4">
          {/* User Info */}
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-700">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-600/50">
              {currentUser.profilePicture ? (
                <img 
                  src={currentUser.profilePicture} 
                  alt="Your profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-white">{currentUser.fullName}</p>
              <select
                value={newPost.isPublic ? 'public' : 'private'}
                onChange={(e) => setNewPost(prev => ({ ...prev, isPublic: e.target.value === 'public' }))}
                className="text-sm bg-slate-700/50 border border-slate-600 rounded px-2 py-1 text-slate-300"
              >
                <option value="public">🌍 Public</option>
                <option value="private">🔒 Private</option>
              </select>
            </div>
          </div>

          {/* Main Text Area with Paste Support */}
          <div className="relative">
            <textarea
              placeholder={`What's on your mind, ${currentUser.fullName.split(' ')[0]}?`}
              value={newPost.description}
              onChange={(e) => setNewPost(prev => ({ ...prev, description: e.target.value }))}
              onPaste={handlePaste}
              onFocus={handleTextAreaFocus}
              rows={4}
              className="w-full px-0 py-2 bg-transparent border-0 text-white text-lg placeholder-slate-400 focus:outline-none resize-none"
              style={{ fontSize: '18px' }}
            />
            
            {/* Paste Hint */}
            {showPasteHint && (
              <div className="absolute top-2 right-2 bg-blue-500/20 border border-blue-500/30 rounded-lg px-3 py-2 text-xs text-blue-300 animate-pulse">
                <div className="flex items-center space-x-1">
                  <Clipboard className="w-3 h-3" />
                  <span>Paste images directly here!</span>
                </div>
              </div>
            )}
          </div>

          {/* Image Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-lg p-6 transition-all duration-200
              ${isDragOver 
                ? 'border-red-500 bg-red-500/10' 
                : 'border-slate-600 hover:border-red-500 hover:bg-red-500/5'
              }
              ${newPost.mediaUrl ? 'border-solid border-green-500' : ''}
            `}
          >
            {newPost.mediaUrl ? (
              <div className="relative">
                <img 
                  src={newPost.mediaUrl} 
                  alt="Upload preview" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={() => setNewPost(prev => ({ ...prev, mediaUrl: '' }))}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-center">
                {isUploading ? (
                  <div className="space-y-3">
                    <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-slate-400">Uploading image...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto">
                      <Camera className="w-8 h-8 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {isDragOver ? 'Drop image here' : 'Add photos/videos'}
                      </p>
                      <p className="text-slate-400 text-sm mt-1">
                        drag and drop, paste from clipboard, or click to select
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="inline-block bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors"
                    >
                      Select Photos
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Paste Instructions */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-blue-300 mb-2">
              <Clipboard className="w-4 h-4" />
              <span className="font-semibold text-sm">Pro Tip: Paste Images Directly!</span>
            </div>
            <p className="text-sm text-blue-300">
              You can paste images directly into the text area above. Just copy an image (Ctrl+C) and paste it (Ctrl+V) while typing your post!
            </p>
          </div>

          {/* Additional Options */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Game (optional)"
              value={newPost.game}
              onChange={(e) => setNewPost(prev => ({ ...prev, game: e.target.value }))}
            />
            <Input
              placeholder="Track (optional)"
              value={newPost.track}
              onChange={(e) => setNewPost(prev => ({ ...prev, track: e.target.value }))}
            />
            <Input
              placeholder="Lap time (optional)"
              value={newPost.lapTime}
              onChange={(e) => setNewPost(prev => ({ ...prev, lapTime: e.target.value }))}
            />
            <Input
              placeholder="Achievement (optional)"
              value={newPost.achievement}
              onChange={(e) => setNewPost(prev => ({ ...prev, achievement: e.target.value }))}
            />
          </div>

          <Input
            placeholder="Tags (comma separated)"
            value={newPost.tags}
            onChange={(e) => setNewPost(prev => ({ ...prev, tags: e.target.value }))}
          />

          {/* Post Button */}
          <Button 
            onClick={handleCreatePost} 
            className="w-full" 
            disabled={!newPost.description.trim() && !newPost.mediaUrl}
          >
            Post
          </Button>
        </div>
      </Modal>

      {/* AI Chat Component */}
      <AIChat
        currentUser={currentUser}
        isOpen={showAIChat}
        onClose={() => setShowAIChat(false)}
        initialType="general"
      />
    </div>
  );
}