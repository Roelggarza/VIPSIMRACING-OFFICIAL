import React, { useState, useEffect } from 'react';
import { Globe, Image, Heart, MessageCircle, Share2, User, Crown, Calendar, Trophy, Video, Play, Send, Upload, Tag } from 'lucide-react';
import { getUsers, User as UserType, getCommunityPosts, CommunityPost, likeCommunityPost, addCommentToCommunityPost, shareCommunityPost, addCommunityPost } from '../../utils/userStorage';
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
  const [showUploadModal, setShowUploadModal] = useState(false);
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

  const handleLike = (postId: string) => {
    likeCommunityPost(postId, currentUser.email);
    setPosts(getCommunityPosts()); // Refresh posts
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
    setPosts(getCommunityPosts()); // Refresh posts
  };

  const handleShare = (postId: string) => {
    shareCommunityPost(postId, currentUser.email);
    setPosts(getCommunityPosts()); // Refresh posts
    alert('Post shared!');
  };

  const handleUploadPost = () => {
    if (!newPost.title.trim() || !newPost.mediaUrl.trim()) {
      alert('Please fill in the required fields');
      return;
    }

    const tagsArray = newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

    addCommunityPost({
      userId: currentUser.email,
      type: newPost.type,
      title: newPost.title,
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

    setPosts(getCommunityPosts()); // Refresh posts
    setShowUploadModal(false);
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUploadModal(true)}
                icon={Upload}
              >
                Share Content
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
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            {post.game && (
                              <>
                                <span>•</span>
                                <span>{post.game}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" icon={Share2} onClick={() => handleShare(post.id)}>
                        Share
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
                        >
                          {post.shares || 0}
                        </Button>
                      </div>
                    </div>

                    {/* Comments */}
                    {post.comments && post.comments.length > 0 && (
                      <div className="space-y-3 mb-4">
                        {post.comments.slice(-3).map((comment) => (
                          <div key={comment.id} className="flex items-start space-x-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-600/50">
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
                            <div className="flex-1">
                              <div className="bg-slate-700/30 rounded-lg p-3">
                                <p className="font-semibold text-white text-sm">{comment.userName}</p>
                                <p className="text-slate-300 text-sm">{comment.text}</p>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Comment */}
                    <div className="flex space-x-2">
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
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Share Racing Content"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Content Type</label>
              <select
                value={newPost.type}
                onChange={(e) => setNewPost(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="screenshot">Screenshot</option>
                <option value="video">Video/Clip</option>
                <option value="lap_record">Lap Record</option>
                <option value="highlight">Race Highlight</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Visibility</label>
              <select
                value={newPost.isPublic ? 'public' : 'private'}
                onChange={(e) => setNewPost(prev => ({ ...prev, isPublic: e.target.value === 'public' }))}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>

          <Input
            label="Title *"
            placeholder="Give your content a catchy title..."
            value={newPost.title}
            onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
          />

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <textarea
              placeholder="Tell us about this moment..."
              value={newPost.description}
              onChange={(e) => setNewPost(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
          </div>

          <Input
            label="Media URL *"
            placeholder="https://example.com/your-image-or-video.jpg"
            value={newPost.mediaUrl}
            onChange={(e) => setNewPost(prev => ({ ...prev, mediaUrl: e.target.value }))}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Game"
              placeholder="e.g., Assetto Corsa"
              value={newPost.game}
              onChange={(e) => setNewPost(prev => ({ ...prev, game: e.target.value }))}
            />
            <Input
              label="Track"
              placeholder="e.g., Silverstone GP"
              value={newPost.track}
              onChange={(e) => setNewPost(prev => ({ ...prev, track: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Lap Time"
              placeholder="e.g., 1:27.543"
              value={newPost.lapTime}
              onChange={(e) => setNewPost(prev => ({ ...prev, lapTime: e.target.value }))}
            />
            <Input
              label="Achievement"
              placeholder="e.g., Personal Best"
              value={newPost.achievement}
              onChange={(e) => setNewPost(prev => ({ ...prev, achievement: e.target.value }))}
            />
          </div>

          <Input
            label="Tags"
            placeholder="racing, silverstone, personal-best (comma separated)"
            value={newPost.tags}
            onChange={(e) => setNewPost(prev => ({ ...prev, tags: e.target.value }))}
          />

          <div className="flex space-x-3 pt-4">
            <Button onClick={handleUploadPost} className="flex-1">
              Share Content
            </Button>
            <Button variant="outline" onClick={() => setShowUploadModal(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}