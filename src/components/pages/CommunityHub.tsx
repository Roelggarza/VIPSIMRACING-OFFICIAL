import React, { useState, useEffect } from 'react';
import { Globe, Image, Heart, MessageCircle, Share2, User, Crown, Calendar, Trophy, Video, Play, Send, Upload, Tag, Plus, Type, Camera, X, Reply, ThumbsUp, MoreHorizontal } from 'lucide-react';
import { getUsers, User as UserType, getCommunityPosts, CommunityPost, likeCommunityPost, addCommentToCommunityPost, addReplyToComment, likeComment, shareCommunityPost, addCommunityPost, Comment } from '../../utils/userStorage';
import Card, { CardHeader, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';

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

  useEffect(() => {
    setPosts(getCommunityPosts());
    setUsers(getUsers());
  }, []);

  const filteredPosts = posts.filter(post => {
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

    addCommentToCommunityPost(postId, {
      userId: currentUser.email,
      userName: currentUser.fullName,
      userAvatar: currentUser.profilePicture,
      text: commentText
    });

    setCommentTexts(prev => ({ ...prev, [postId]: '' }));
    refreshPosts();
  };

  const handleReply = (postId: string, commentId: string) => {
    const replyKey = `${postId}-${commentId}`;
    const replyText = replyTexts[replyKey]?.trim();
    if (!replyText) return;

    addReplyToComment(postId, commentId, {
      userId: currentUser.email,
      userName: currentUser.fullName,
      userAvatar: currentUser.profilePicture,
      text: replyText
    });

    setReplyTexts(prev => ({ ...prev, [replyKey]: '' }));
    refreshPosts();
  };

  const handleLikeComment = (postId: string, commentId: string) => {
    likeComment(postId, commentId, currentUser.email);
    refreshPosts();
  };

  const handleShare = (postId: string) => {
    shareCommunityPost(postId, currentUser.email);
    refreshPosts();
    alert('Post shared!');
  };

  const toggleReplies = (commentId: string) => {
    setShowReplies(prev => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const handleCreatePost = () => {
    if (!newPost.title.trim() && !newPost.description.trim()) {
      alert('Please add some content to your post');
      return;
    }

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
              <div className="flex items-center space-x-2 mb-1">
                <p className="font-semibold text-white text-sm">{comment.userName}</p>
                <p className="text-xs text-slate-500">{formatTimeAgo(comment.createdAt)}</p>
              </div>
              <p className="text-slate-300 text-sm">{comment.text}</p>
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
              <h2 className="text-xl font-bold text-white">Community Hub</h2>
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300">
            Share your racing moments, lap records, and highlights with the community!
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
                      <Button variant="ghost" size="sm" icon={MoreHorizontal}>
                        <span className="sr-only">More options</span>
                      </Button>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-white mb-2">{post.title}</h3>
                    {post.description && (
                      <p className="text-slate-300 mb-4">{post.description}</p>
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
                          onClick={() => handleShare(post.id)}
                        >
                          {post.shares || 0}
                        </Button>
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

      {/* Create Post Modal - Facebook Style */}
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

          {/* Main Text Area */}
          <div>
            <textarea
              placeholder={`What's on your mind, ${currentUser.fullName.split(' ')[0]}?`}
              value={newPost.description}
              onChange={(e) => setNewPost(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-0 py-2 bg-transparent border-0 text-white text-lg placeholder-slate-400 focus:outline-none resize-none"
              style={{ fontSize: '18px' }}
            />
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
                        or drag and drop
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
    </div>
  );
}