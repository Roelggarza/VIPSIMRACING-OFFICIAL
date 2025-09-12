import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Globe, Plus, Heart, Share2, MessageCircle, Flag, Camera, Video, Eye, EyeOff, Trash2, Monitor, CheckCircle, XCircle, Clock, Edit, Search, Filter, Users, Trophy, Star, ThumbsUp, Send } from 'lucide-react';
import { 
  getCommunityPosts, 
  addCommunityPost, 
  likeCommunityPost, 
  shareCommunityPost, 
  addCommentToCommunityPost,
  reportPost,
  getUsers,
  User as UserType,
  CommunityPost,
  Comment,
  addAdminNotification
} from '../../utils/userStorage';
import { deletePostWithAudit, validatePostContent } from '../../utils/postManagement';
import { generatePostShareData } from '../../utils/socialSharing';
import { debounce, performanceCache } from '../../utils/performanceOptimization';
import Card, { CardHeader, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import ImageDropZone from '../ui/ImageDropZone';
import SocialShareModal from '../ui/SocialShareModal';
import PostEditModal from '../ui/PostEditModal';

interface CommunityHubProps {
  currentUser: UserType;
}

interface ScreenShareRequest {
  id: string;
  userId: string;
  userName: string;
  simulatorId: number;
  game: string;
  status: 'pending' | 'approved' | 'denied';
  requestTime: string;
  adminNotes?: string;
}

interface PostFilters {
  type: 'all' | 'screenshot' | 'video' | 'lap_record' | 'highlight';
  sortBy: 'newest' | 'popular' | 'trending';
  timeRange: 'all' | 'today' | 'week' | 'month';
}

export default function CommunityHub({ currentUser }: CommunityHubProps) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [activeTab, setActiveTab] = useState<'feed' | 'share' | 'live'>('feed');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [newComment, setNewComment] = useState<{[postId: string]: string}>({});
  const [filters, setFilters] = useState<PostFilters>({
    type: 'all',
    sortBy: 'newest',
    timeRange: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
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
  const [reportData, setReportData] = useState({
    reason: 'spam' as 'spam' | 'inappropriate' | 'harassment' | 'copyright' | 'other',
    description: ''
  });
  const [screenShareRequests, setScreenShareRequests] = useState<ScreenShareRequest[]>([]);
  const [showScreenShareModal, setShowScreenShareModal] = useState(false);
  const [screenShareData, setScreenShareData] = useState({
    simulatorId: 1,
    game: ''
  });
  const [shareData, setShareData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setSearchTerm(term);
    }, 300),
    []
  );

  // Load data with caching
  const loadCommunityData = useCallback(() => {
    try {
      const cacheKey = 'community_data';
      let cachedData = performanceCache.get(cacheKey);
      
      if (!cachedData) {
        const allPosts = getCommunityPosts().filter(p => !p.isHidden);
        const allUsers = getUsers();
        cachedData = { posts: allPosts, users: allUsers };
        performanceCache.set(cacheKey, cachedData, 30000); // 30 seconds cache
      }
      
      setPosts(cachedData.posts);
      setUsers(cachedData.users);
      loadScreenShareRequests();
    } catch (error) {
      console.error('Error loading community data:', error);
      setError('Failed to load community data. Please refresh the page.');
    }
  }, []);

  useEffect(() => {
    loadCommunityData();
  }, [loadCommunityData]);

  const loadScreenShareRequests = () => {
    try {
      const requests = localStorage.getItem('screen_share_requests');
      setScreenShareRequests(requests ? JSON.parse(requests) : []);
    } catch (error) {
      console.error('Error loading screen share requests:', error);
    }
  };

  const saveScreenShareRequests = (requests: ScreenShareRequest[]) => {
    try {
      localStorage.setItem('screen_share_requests', JSON.stringify(requests));
      setScreenShareRequests(requests);
    } catch (error) {
      console.error('Error saving screen share requests:', error);
    }
  };

  // Filtered and sorted posts with memoization
  const filteredPosts = useMemo(() => {
    let filtered = [...posts];

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(term) ||
        post.description?.toLowerCase().includes(term) ||
        post.game?.toLowerCase().includes(term) ||
        post.track?.toLowerCase().includes(term) ||
        post.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Apply type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(post => post.type === filters.type);
    }

    // Apply time range filter
    if (filters.timeRange !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      
      switch (filters.timeRange) {
        case 'today':
          cutoff.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoff.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoff.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(post => new Date(post.createdAt) >= cutoff);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'popular':
        filtered.sort((a, b) => (b.likes + b.shares) - (a.likes + a.shares));
        break;
      case 'trending':
        // Trending = recent posts with high engagement
        filtered.sort((a, b) => {
          const aScore = (a.likes + a.shares) / Math.max(1, (Date.now() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60));
          const bScore = (b.likes + b.shares) / Math.max(1, (Date.now() - new Date(b.createdAt).getTime()) / (1000 * 60 * 60));
          return bScore - aScore;
        });
        break;
      default: // newest
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return filtered;
  }, [posts, searchTerm, filters]);

  const handleCreatePost = async () => {
    if (!newPost.title.trim()) {
      setError('Title is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Validate post content
      const validation = validatePostContent({
        ...newPost,
        tags: newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
      });

      if (!validation.isValid) {
        setError(validation.issues.join(', '));
        setIsLoading(false);
        return;
      }

      const postData = {
        userId: currentUser.email,
        type: newPost.type,
        title: newPost.title.trim(),
        description: newPost.description.trim(),
        mediaUrl: newPost.mediaUrl,
        game: newPost.game.trim(),
        track: newPost.track.trim(),
        lapTime: newPost.lapTime.trim(),
        achievement: newPost.achievement.trim(),
        tags: newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        isPublic: newPost.isPublic
      };

      const post = addCommunityPost(postData);
      
      // Invalidate cache and reload
      performanceCache.invalidate('community_data');
      loadCommunityData();
      
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
      setIsLoading(false);
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post. Please try again.');
      setIsLoading(false);
    }
  };

  const handleLike = useCallback((postId: string) => {
    try {
      likeCommunityPost(postId, currentUser.email);
      performanceCache.invalidate('community_data');
      loadCommunityData();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  }, [currentUser.email, loadCommunityData]);

  const handleShare = useCallback((postId: string) => {
    try {
      shareCommunityPost(postId, currentUser.email);
      performanceCache.invalidate('community_data');
      loadCommunityData();
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  }, [currentUser.email, loadCommunityData]);

  const handleSharePost = (post: CommunityPost) => {
    const postShareData = generatePostShareData(post);
    setShareData(postShareData);
    setSelectedPost(post);
    setShowShareModal(true);
  };

  const handleEditPost = (post: CommunityPost) => {
    setSelectedPost(post);
    setShowEditModal(true);
  };

  const handleDeletePost = async (post: CommunityPost) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      const result = deletePostWithAudit(post.id, currentUser.email);
      
      if (result.success) {
        performanceCache.invalidate('community_data');
        loadCommunityData();
        alert('Post deleted successfully');
      } else {
        alert(result.errors?.join('\n') || 'Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  const handlePostUpdated = () => {
    performanceCache.invalidate('community_data');
    loadCommunityData();
    setShowEditModal(false);
    setSelectedPost(null);
  };

  const handleReport = async () => {
    if (!selectedPost || !reportData.description.trim()) {
      setError('Please provide a description for the report');
      return;
    }

    try {
      reportPost(selectedPost.id, currentUser.email, reportData.reason, reportData.description);
      setShowReportModal(false);
      setSelectedPost(null);
      setReportData({ reason: 'spam', description: '' });
      alert('Report submitted successfully. Our moderation team will review it shortly.');
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleScreenShareRequest = () => {
    if (!screenShareData.game.trim()) {
      setError('Please specify what game you will be playing');
      return;
    }

    try {
      const requests = [...screenShareRequests];
      const newRequest: ScreenShareRequest = {
        id: Date.now().toString(),
        userId: currentUser.email,
        userName: currentUser.fullName,
        simulatorId: screenShareData.simulatorId,
        game: screenShareData.game,
        status: 'pending',
        requestTime: new Date().toISOString()
      };

      requests.push(newRequest);
      saveScreenShareRequests(requests);
      
      // Add admin notification
      addAdminNotification({
        type: 'screen_share_request',
        title: 'New Screen Share Request',
        message: `${currentUser.fullName} wants to stream ${screenShareData.game} on Simulator ${screenShareData.simulatorId}`,
        data: {
          userId: currentUser.email,
          simulatorId: screenShareData.simulatorId,
          game: screenShareData.game
        }
      });
      
      setShowScreenShareModal(false);
      setScreenShareData({ simulatorId: 1, game: '' });
      alert('Screen share request submitted! Admins will review your request shortly.');
    } catch (error) {
      console.error('Error submitting screen share request:', error);
      setError('Failed to submit request. Please try again.');
    }
  };

  const handleAddComment = (postId: string) => {
    const commentText = newComment[postId]?.trim();
    if (!commentText) return;

    try {
      addCommentToCommunityPost(postId, {
        userId: currentUser.email,
        userName: currentUser.fullName,
        userAvatar: currentUser.profilePicture,
        text: commentText
      });

      setNewComment(prev => ({ ...prev, [postId]: '' }));
      performanceCache.invalidate('community_data');
      loadCommunityData();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const getUserById = useCallback((userId: string) => {
    return users.find(u => u.email === userId);
  }, [users]);

  const formatTimeAgo = useCallback((timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return time.toLocaleDateString();
  }, []);

  const approvedScreenShares = screenShareRequests.filter(r => r.status === 'approved');
  const userPendingRequest = screenShareRequests.find(r => r.userId === currentUser.email && r.status === 'pending');

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'screenshot': return <Camera className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'lap_record': return <Clock className="w-4 h-4" />;
      case 'highlight': return <Star className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'screenshot': return 'text-blue-400';
      case 'video': return 'text-purple-400';
      case 'lap_record': return 'text-yellow-400';
      case 'highlight': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Community Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-bold text-white">Community Hub</h2>
              <span className="bg-slate-700/50 px-2 py-1 rounded text-xs text-slate-400">
                {filteredPosts.length} posts
              </span>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={activeTab === 'feed' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('feed')}
                icon={Globe}
              >
                Feed
              </Button>
              <Button
                variant={activeTab === 'share' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('share')}
                icon={Plus}
              >
                Share
              </Button>
              <Button
                variant={activeTab === 'live' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('live')}
                icon={Monitor}
                className="relative"
              >
                Live
                {approvedScreenShares.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {approvedScreenShares.length}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-400">
            <XCircle className="w-5 h-5" />
            <span className="font-semibold">{error}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setError('')}
            className="mt-2"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'feed' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search posts, games, tracks, or tags..."
                    onChange={(e) => debouncedSearch(e.target.value)}
                    icon={Search}
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowCreatePost(true)}
                  icon={Plus}
                >
                  Create Post
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {/* Type Filter */}
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
                  className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All Types</option>
                  <option value="screenshot">Screenshots</option>
                  <option value="video">Videos</option>
                  <option value="lap_record">Lap Records</option>
                  <option value="highlight">Highlights</option>
                </select>

                {/* Sort Filter */}
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                  className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="popular">Most Popular</option>
                  <option value="trending">Trending</option>
                </select>

                {/* Time Range Filter */}
                <select
                  value={filters.timeRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, timeRange: e.target.value as any }))}
                  className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Posts Feed */}
          <div className="space-y-6">
            {filteredPosts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Globe className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">
                    {searchTerm ? 'No posts found' : 'Welcome to the Community!'}
                  </h3>
                  <p className="text-slate-400 mb-6">
                    {searchTerm 
                      ? 'Try adjusting your search or filters to find more content.'
                      : 'Be the first to share your racing screenshots, videos, and achievements.'
                    }
                  </p>
                  <Button onClick={() => setShowCreatePost(true)} icon={Plus}>
                    {searchTerm ? 'Create New Post' : 'Create First Post'}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredPosts.map((post) => {
                const author = getUserById(post.userId);
                const isLiked = post.likedBy.includes(currentUser.email);
                const isShared = post.sharedBy.includes(currentUser.email);
                const commentsExpanded = expandedComments.has(post.id);

                return (
                  <Card key={post.id} className="hover:bg-slate-800/30 transition-colors">
                    <CardContent className="p-6">
                      {/* Post Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-600 border-2 border-slate-500">
                            {author?.profilePicture ? (
                              <img src={author.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Users className="w-5 h-5 text-slate-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="font-semibold text-white">{author?.fullName || 'Unknown User'}</p>
                              {author?.vipMembership?.active && (
                                <span className="bg-red-500/20 px-2 py-1 rounded text-xs text-red-300 font-bold">
                                  VIP
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-slate-400">
                              <span>{formatTimeAgo(post.createdAt)}</span>
                              <span>•</span>
                              <div className={`flex items-center space-x-1 ${getPostTypeColor(post.type)}`}>
                                {getPostTypeIcon(post.type)}
                                <span className="capitalize">{post.type.replace('_', ' ')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {/* User's own post controls */}
                          {(post.userId === currentUser.email || currentUser.isAdmin) && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditPost(post)}
                                icon={Edit}
                                className="text-blue-400 hover:text-blue-300"
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeletePost(post)}
                                icon={Trash2}
                                className="text-red-400 hover:text-red-300"
                              >
                                Delete
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPost(post);
                              setShowReportModal(true);
                            }}
                            icon={Flag}
                            className="text-slate-400 hover:text-slate-300"
                          >
                            Report
                          </Button>
                        </div>
                      </div>

                      {/* Post Content */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white">{post.title}</h3>
                        {post.description && (
                          <p className="text-slate-300 leading-relaxed">{post.description}</p>
                        )}

                        {/* Media */}
                        {post.mediaUrl && (
                          <div className="rounded-lg overflow-hidden bg-slate-700/30">
                            {post.type === 'video' ? (
                              <video 
                                src={post.mediaUrl} 
                                controls 
                                className="w-full h-auto max-h-96"
                                preload="metadata"
                              />
                            ) : (
                              <img 
                                src={post.mediaUrl} 
                                alt={post.title}
                                className="w-full h-auto max-h-96 object-cover cursor-pointer hover:scale-105 transition-transform"
                                onClick={() => window.open(post.mediaUrl, '_blank')}
                              />
                            )}
                          </div>
                        )}

                        {/* Post Details */}
                        <div className="flex flex-wrap gap-2 text-sm">
                          {post.game && (
                            <span className="bg-blue-500/20 px-3 py-1 rounded-full text-blue-300 border border-blue-500/30">
                              🎮 {post.game}
                            </span>
                          )}
                          {post.track && (
                            <span className="bg-green-500/20 px-3 py-1 rounded-full text-green-300 border border-green-500/30">
                              🏁 {post.track}
                            </span>
                          )}
                          {post.lapTime && (
                            <span className="bg-yellow-500/20 px-3 py-1 rounded-full text-yellow-300 border border-yellow-500/30">
                              ⏱️ {post.lapTime}
                            </span>
                          )}
                          {post.achievement && (
                            <span className="bg-purple-500/20 px-3 py-1 rounded-full text-purple-300 border border-purple-500/30">
                              🏆 {post.achievement}
                            </span>
                          )}
                        </div>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {post.tags.map((tag, index) => (
                              <span 
                                key={index} 
                                className="bg-slate-700/50 px-2 py-1 rounded text-xs text-slate-300 hover:bg-slate-600/50 cursor-pointer transition-colors"
                                onClick={() => debouncedSearch(tag)}
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Post Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-700/50 mt-4">
                        <div className="flex items-center space-x-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(post.id)}
                            className={`transition-all ${isLiked ? 'text-red-400 scale-110' : 'text-slate-400 hover:text-red-400'}`}
                          >
                            <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                            {post.likes}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSharePost(post)}
                            className={`transition-all ${isShared ? 'text-blue-400' : 'text-slate-400 hover:text-blue-400'}`}
                          >
                            <Share2 className="w-4 h-4 mr-1" />
                            {post.shares}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleComments(post.id)}
                            className="text-slate-400 hover:text-green-400"
                          >
                            <MessageCircle className="w-4 h-4 mr-1" />
                            {post.comments?.length || 0}
                          </Button>
                        </div>
                      </div>

                      {/* Comments Section */}
                      {commentsExpanded && (
                        <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-4">
                          {/* Add Comment */}
                          <div className="flex space-x-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-600">
                              {currentUser.profilePicture ? (
                                <img src={currentUser.profilePicture} alt="Your avatar" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Users className="w-4 h-4 text-slate-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 flex space-x-2">
                              <input
                                type="text"
                                placeholder="Add a comment..."
                                value={newComment[post.id] || ''}
                                onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    handleAddComment(post.id);
                                  }
                                }}
                                className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAddComment(post.id)}
                                disabled={!newComment[post.id]?.trim()}
                                icon={Send}
                              >
                                Post
                              </Button>
                            </div>
                          </div>

                          {/* Comments List */}
                          {post.comments && post.comments.length > 0 && (
                            <div className="space-y-3">
                              {post.comments.map((comment) => (
                                <div key={comment.id} className="flex space-x-3">
                                  <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-600">
                                    {comment.userAvatar ? (
                                      <img src={comment.userAvatar} alt="Commenter avatar" className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Users className="w-4 h-4 text-slate-400" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="bg-slate-700/30 rounded-lg p-3">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <span className="font-semibold text-white text-sm">{comment.userName}</span>
                                        <span className="text-xs text-slate-500">{formatTimeAgo(comment.createdAt)}</span>
                                      </div>
                                      <p className="text-slate-300 text-sm">{comment.text}</p>
                                    </div>
                                    <div className="flex items-center space-x-2 mt-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-slate-500 hover:text-red-400 text-xs"
                                      >
                                        <ThumbsUp className="w-3 h-3 mr-1" />
                                        {comment.likes}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}

      {activeTab === 'share' && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-bold text-white">Share Your Racing Content</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { type: 'screenshot', label: 'Screenshot', icon: Camera, desc: 'Share racing screenshots' },
                  { type: 'video', label: 'Video', icon: Video, desc: 'Upload racing videos' },
                  { type: 'lap_record', label: 'Lap Record', icon: Clock, desc: 'Share your best times' },
                  { type: 'highlight', label: 'Highlight', icon: Star, desc: 'Racing highlights' }
                ].map(({ type, label, icon: Icon, desc }) => (
                  <Button
                    key={type}
                    variant={newPost.type === type ? 'primary' : 'outline'}
                    onClick={() => setNewPost(prev => ({ ...prev, type: type as any }))}
                    className="h-24 flex-col space-y-2 p-4"
                  >
                    <Icon className="w-6 h-6" />
                    <div className="text-center">
                      <span className="text-sm font-semibold">{label}</span>
                      <p className="text-xs opacity-75">{desc}</p>
                    </div>
                  </Button>
                ))}
              </div>

              <Input
                label="Title"
                placeholder="Give your post a catchy title..."
                value={newPost.title}
                onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                maxLength={100}
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Description</label>
                <textarea
                  placeholder="Tell us about your racing experience..."
                  value={newPost.description}
                  onChange={(e) => setNewPost(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
                <p className="text-xs text-slate-500">{newPost.description.length}/500 characters</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Media (Optional)</label>
                <ImageDropZone onImageSelect={(imageData) => setNewPost(prev => ({ ...prev, mediaUrl: imageData }))} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Game"
                  placeholder="e.g., Assetto Corsa"
                  value={newPost.game}
                  onChange={(e) => setNewPost(prev => ({ ...prev, game: e.target.value }))}
                />
                <Input
                  label="Track"
                  placeholder="e.g., Silverstone"
                  value={newPost.track}
                  onChange={(e) => setNewPost(prev => ({ ...prev, track: e.target.value }))}
                />
              </div>

              {newPost.type === 'lap_record' && (
                <Input
                  label="Lap Time"
                  placeholder="e.g., 1:23.456"
                  value={newPost.lapTime}
                  onChange={(e) => setNewPost(prev => ({ ...prev, lapTime: e.target.value }))}
                />
              )}

              <Input
                label="Tags (comma-separated)"
                placeholder="e.g., racing, silverstone, personal-best"
                value={newPost.tags}
                onChange={(e) => setNewPost(prev => ({ ...prev, tags: e.target.value }))}
              />

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={newPost.isPublic}
                  onChange={(e) => setNewPost(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="w-4 h-4 text-red-500 bg-slate-700 border-slate-600 rounded focus:ring-red-500"
                />
                <label htmlFor="isPublic" className="text-sm text-slate-300">
                  Make this post public (visible to all community members)
                </label>
              </div>

              <Button 
                onClick={handleCreatePost}
                disabled={!newPost.title.trim() || isLoading}
                className="w-full"
                icon={Plus}
              >
                {isLoading ? 'Creating Post...' : 'Share Post'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'live' && (
        <div className="space-y-6">
          {/* Screen Share Request */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Share Your Racing Screen</h3>
                {!userPendingRequest && (
                  <Button
                    onClick={() => setShowScreenShareModal(true)}
                    icon={Monitor}
                    size="sm"
                  >
                    Request Screen Share
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {userPendingRequest ? (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-yellow-400 mb-2">
                    <Clock className="w-5 h-5" />
                    <span className="font-semibold">Screen Share Request Pending</span>
                  </div>
                  <p className="text-yellow-200 text-sm">
                    Your request to share Simulator {userPendingRequest.simulatorId} while playing {userPendingRequest.game} is being reviewed by admins.
                  </p>
                  <p className="text-yellow-300 text-xs mt-2">
                    Submitted: {new Date(userPendingRequest.requestTime).toLocaleString()}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Monitor className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                  <h4 className="text-lg font-bold text-white mb-2">Share Your Racing Action</h4>
                  <p className="text-slate-400 mb-4">
                    Request to share your racing simulator screen with the community. 
                    Admins will review and approve your request.
                  </p>
                  <Button
                    onClick={() => setShowScreenShareModal(true)}
                    icon={Monitor}
                  >
                    Request Screen Share
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Live Streams */}
          {approvedScreenShares.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {approvedScreenShares.map((stream) => (
                <Card key={stream.id} className="hover:scale-105 transition-transform">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-600">
                          <div className="w-full h-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-slate-400" />
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-white">{stream.userName}</p>
                          <p className="text-sm text-slate-400">Simulator {stream.simulatorId}</p>
                        </div>
                      </div>
                      <div className="bg-red-500/20 px-3 py-1 rounded-full border border-red-500/30">
                        <span className="text-red-300 text-xs font-bold flex items-center">
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></div>
                          LIVE
                        </span>
                      </div>
                    </div>

                    <div className="aspect-video bg-slate-700 rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                      <div className="text-center">
                        <Video className="w-12 h-12 text-slate-500 mx-auto mb-2" />
                        <p className="text-slate-400 text-sm">Live Stream</p>
                        <p className="text-white font-semibold">{stream.game}</p>
                      </div>
                      {/* Simulated racing overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent"></div>
                    </div>

                    <Button variant="outline" size="sm" className="w-full" icon={Eye}>
                      Watch Stream
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Video className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No Live Streams</h3>
                <p className="text-slate-400">
                  No one is currently streaming their racing session. 
                  Be the first to share your racing action!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Screen Share Request Modal */}
      <Modal
        isOpen={showScreenShareModal}
        onClose={() => setShowScreenShareModal(false)}
        title="Request Screen Share"
      >
        <div className="space-y-4">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <h4 className="font-semibold text-blue-300 mb-2">Screen Share Guidelines</h4>
            <ul className="text-blue-200 text-sm space-y-1">
              <li>• Keep content family-friendly and appropriate</li>
              <li>• No offensive language or behavior</li>
              <li>• Focus on racing content and gameplay</li>
              <li>• Admins may end streams that violate guidelines</li>
            </ul>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Simulator</label>
            <select
              value={screenShareData.simulatorId}
              onChange={(e) => setScreenShareData(prev => ({ ...prev, simulatorId: parseInt(e.target.value) }))}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {Array.from({ length: 8 }, (_, i) => (
                <option key={i + 1} value={i + 1}>Simulator {i + 1}</option>
              ))}
            </select>
          </div>

          <Input
            label="Game"
            placeholder="What game will you be playing?"
            value={screenShareData.game}
            onChange={(e) => setScreenShareData(prev => ({ ...prev, game: e.target.value }))}
          />

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex space-x-3">
            <Button 
              onClick={handleScreenShareRequest}
              disabled={!screenShareData.game.trim()}
              className="flex-1"
              icon={Monitor}
            >
              Submit Request
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setShowScreenShareModal(false);
                setError('');
              }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Social Share Modal */}
      <SocialShareModal
        isOpen={showShareModal}
        onClose={() => {
          setShowShareModal(false);
          setSelectedPost(null);
          setShareData(null);
        }}
        shareData={shareData}
        title="Share Racing Post"
      />

      {/* Post Edit Modal */}
      <PostEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedPost(null);
        }}
        post={selectedPost}
        userEmail={currentUser.email}
        onPostUpdated={handlePostUpdated}
      />

      {/* Report Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => {
          setShowReportModal(false);
          setSelectedPost(null);
          setReportData({ reason: 'spam', description: '' });
        }}
        title="Report Content"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Reason for Report</label>
            <select
              value={reportData.reason}
              onChange={(e) => setReportData(prev => ({ ...prev, reason: e.target.value as any }))}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="spam">Spam</option>
              <option value="inappropriate">Inappropriate Content</option>
              <option value="harassment">Harassment</option>
              <option value="copyright">Copyright Violation</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Description</label>
            <textarea
              placeholder="Please provide details about why you're reporting this content..."
              value={reportData.description}
              onChange={(e) => setReportData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
          </div>

          <div className="flex space-x-3">
            <Button 
              onClick={handleReport}
              disabled={!reportData.description.trim()}
              className="flex-1"
              icon={Flag}
            >
              Submit Report
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setShowReportModal(false);
                setSelectedPost(null);
                setReportData({ reason: 'spam', description: '' });
              }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}