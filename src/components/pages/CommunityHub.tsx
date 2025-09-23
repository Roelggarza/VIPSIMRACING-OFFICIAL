import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Globe, 
  Plus, 
  Heart, 
  MessageCircle, 
  Share2, 
  Flag, 
  Search, 
  Filter, 
  Trophy, 
  Clock, 
  User, 
  Image as ImageIcon, 
  Video, 
  Target, 
  Star,
  TrendingUp,
  Calendar,
  Tag,
  Eye,
  ThumbsUp,
  Send,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Camera,
  Play,
  Award,
  Crown,
  Gamepad2,
  Timer,
  Zap
} from 'lucide-react';
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
  Comment
} from '../../utils/userStorage';
import { 
  validatePostContent, 
  createPostWithValidation, 
  editPostWithValidation,
  deletePostWithAudit,
  addPostAuditLog
} from '../../utils/postManagement';
import { 
  performanceCache, 
  debounce, 
  performanceMonitor,
  AsyncQueue
} from '../../utils/performanceOptimization';
import { generatePostShareData, shareToSocial, socialPlatforms } from '../../utils/socialSharing';
import Card, { CardHeader, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import ImageDropZone from '../ui/ImageDropZone';
import PostEditModal from '../ui/PostEditModal';
import SocialShareModal from '../ui/SocialShareModal';
import AIChat from '../ui/AIChat';

interface CommunityHubProps {
  currentUser: UserType;
}

interface PostFilters {
  type: 'all' | 'screenshot' | 'video' | 'lap_record' | 'highlight';
  sortBy: 'newest' | 'popular' | 'trending' | 'oldest';
  timeRange: 'all' | 'today' | 'week' | 'month';
  game: string;
}

interface NewPostData {
  type: 'screenshot' | 'video' | 'lap_record' | 'highlight';
  title: string;
  description: string;
  mediaUrl: string;
  game: string;
  track: string;
  lapTime: string;
  achievement: string;
  tags: string[];
}

export default function CommunityHub({ currentUser }: CommunityHubProps) {
  // Core state
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // UI state
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showEditPost, setShowEditPost] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  
  // Selected items
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [shareData, setShareData] = useState<any>(null);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<PostFilters>({
    type: 'all',
    sortBy: 'newest',
    timeRange: 'all',
    game: ''
  });
  
  // New post form
  const [newPost, setNewPost] = useState<NewPostData>({
    type: 'screenshot',
    title: '',
    description: '',
    mediaUrl: '',
    game: '',
    track: '',
    lapTime: '',
    achievement: '',
    tags: []
  });
  const [newPostErrors, setNewPostErrors] = useState<string[]>([]);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  
  // Comments
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [newComments, setNewComments] = useState<{[postId: string]: string}>({});
  
  // Report form
  const [reportData, setReportData] = useState({
    reason: 'spam' as 'spam' | 'inappropriate' | 'harassment' | 'copyright' | 'other',
    description: ''
  });

  // Performance optimization with async queue
  const asyncQueue = useMemo(() => new AsyncQueue(3), []);

  // Load data with caching
  const loadCommunityData = useCallback(async () => {
    const endTiming = performanceMonitor.startTiming('CommunityHub:LoadData');
    
    try {
      setIsLoading(true);
      setError('');
      
      // Check cache first
      const cachedPosts = performanceCache.get<CommunityPost[]>('community_posts');
      const cachedUsers = performanceCache.get<UserType[]>('community_users');
      
      if (cachedPosts && cachedUsers) {
        setPosts(cachedPosts);
        setUsers(cachedUsers);
        setIsLoading(false);
        endTiming();
        return;
      }
      
      // Load fresh data
      await asyncQueue.add(async () => {
        const freshPosts = getCommunityPosts().filter(post => !post.isHidden);
        const freshUsers = getUsers();
        
        // Cache for 30 seconds
        performanceCache.set('community_posts', freshPosts, 30000);
        performanceCache.set('community_users', freshUsers, 30000);
        
        setPosts(freshPosts);
        setUsers(freshUsers);
      });
      
    } catch (err) {
      console.error('Failed to load community data:', err);
      setError('Failed to load community posts. Please refresh the page.');
    } finally {
      setIsLoading(false);
      endTiming();
    }
  }, [asyncQueue]);

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((term: string) => {
      setSearchTerm(term);
    }, 300),
    []
  );

  // Filtered and sorted posts with memoization
  const filteredPosts = useMemo(() => {
    const endTiming = performanceMonitor.startTiming('CommunityHub:FilterPosts');
    
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
    
    // Apply game filter
    if (filters.game) {
      filtered = filtered.filter(post => post.game === filters.game);
    }
    
    // Apply time range filter
    if (filters.timeRange !== 'all') {
      const now = new Date();
      const timeRanges = {
        today: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000
      };
      
      const cutoff = now.getTime() - timeRanges[filters.timeRange as keyof typeof timeRanges];
      filtered = filtered.filter(post => new Date(post.createdAt).getTime() > cutoff);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'popular':
          return (b.likes + b.shares + (b.comments?.length || 0)) - (a.likes + a.shares + (a.comments?.length || 0));
        case 'trending':
          // Trending = recent posts with high engagement
          const aScore = (a.likes + a.shares) / Math.max(1, (Date.now() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60));
          const bScore = (b.likes + b.shares) / Math.max(1, (Date.now() - new Date(b.createdAt).getTime()) / (1000 * 60 * 60));
          return bScore - aScore;
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default: // newest
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
    
    endTiming();
    return filtered;
  }, [posts, searchTerm, filters]);

  // Get unique games for filter dropdown
  const availableGames = useMemo(() => {
    const games = [...new Set(posts.map(post => post.game).filter(Boolean))];
    return games.sort();
  }, [posts]);

  // Load data on mount
  useEffect(() => {
    loadCommunityData();
  }, [loadCommunityData]);

  // Invalidate cache when user creates/updates posts
  const invalidateCache = useCallback(() => {
    performanceCache.invalidate('community_posts');
    performanceCache.invalidate('community_users');
  }, []);

  // Handle post creation
  const handleCreatePost = async () => {
    if (!newPost.title.trim()) {
      setNewPostErrors(['Title is required']);
      return;
    }

    setIsCreatingPost(true);
    setNewPostErrors([]);

    try {
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
        tags: newPost.tags.filter(tag => tag.trim().length > 0),
        isPublic: true
      };

      const result = createPostWithValidation(postData, currentUser.email);
      
      if (!result.success) {
        setNewPostErrors(result.errors || ['Failed to create post']);
        setIsCreatingPost(false);
        return;
      }

      // Reset form
      setNewPost({
        type: 'screenshot',
        title: '',
        description: '',
        mediaUrl: '',
        game: '',
        track: '',
        lapTime: '',
        achievement: '',
        tags: []
      });
      
      setShowCreatePost(false);
      invalidateCache();
      await loadCommunityData();
      
    } catch (err) {
      console.error('Failed to create post:', err);
      setNewPostErrors(['An error occurred while creating the post']);
    } finally {
      setIsCreatingPost(false);
    }
  };

  // Handle post interactions
  const handleLikePost = useCallback(async (postId: string) => {
    try {
      await asyncQueue.add(async () => {
        likeCommunityPost(postId, currentUser.email);
        invalidateCache();
        await loadCommunityData();
      });
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  }, [currentUser.email, asyncQueue, invalidateCache, loadCommunityData]);

  const handleSharePost = useCallback((post: CommunityPost) => {
    try {
      shareCommunityPost(post.id, currentUser.email);
      const shareData = generatePostShareData(post);
      setShareData(shareData);
      setShowShareModal(true);
      invalidateCache();
      loadCommunityData();
    } catch (err) {
      console.error('Failed to share post:', err);
    }
  }, [currentUser.email, invalidateCache, loadCommunityData]);

  const handleAddComment = useCallback(async (postId: string) => {
    const commentText = newComments[postId]?.trim();
    if (!commentText) return;

    try {
      await asyncQueue.add(async () => {
        const commentData = {
          userId: currentUser.email,
          userName: currentUser.fullName,
          userAvatar: currentUser.profilePicture,
          text: commentText
        };
        
        addCommentToCommunityPost(postId, commentData);
        setNewComments(prev => ({ ...prev, [postId]: '' }));
        invalidateCache();
        await loadCommunityData();
      });
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  }, [currentUser, newComments, asyncQueue, invalidateCache, loadCommunityData]);

  const handleReportPost = useCallback(async () => {
    if (!selectedPost || !reportData.description.trim()) {
      return;
    }

    try {
      await asyncQueue.add(async () => {
        reportPost(
          selectedPost.id,
          currentUser.email,
          reportData.reason,
          reportData.description
        );
        
        setShowReportModal(false);
        setSelectedPost(null);
        setReportData({ reason: 'spam', description: '' });
        alert('Report submitted successfully. Our moderation team will review it shortly.');
      });
    } catch (err) {
      console.error('Failed to report post:', err);
      alert('Failed to submit report. Please try again.');
    }
  }, [selectedPost, reportData, currentUser.email, asyncQueue]);

  // Get user data for post
  const getUserForPost = useCallback((userId: string) => {
    return users.find(user => user.email === userId) || {
      fullName: 'Unknown User',
      email: userId,
      profilePicture: '',
      vipMembership: { active: false }
    };
  }, [users]);

  // Format time ago
  const formatTimeAgo = useCallback((dateString: string) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffMs = now.getTime() - postDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return postDate.toLocaleDateString();
  }, []);

  // Handle image upload for new post
  const handleImageUpload = useCallback((imageData: string) => {
    setNewPost(prev => ({ ...prev, mediaUrl: imageData }));
  }, []);

  // Handle tag input
  const handleTagInput = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const input = e.currentTarget;
      const tag = input.value.trim();
      
      if (tag && !newPost.tags.includes(tag) && newPost.tags.length < 10) {
        setNewPost(prev => ({
          ...prev,
          tags: [...prev.tags, tag]
        }));
        input.value = '';
      }
    }
  }, [newPost.tags]);

  const removeTag = useCallback((tagToRemove: string) => {
    setNewPost(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }, []);

  // Toggle comment expansion
  const toggleComments = useCallback((postId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  }, []);

  // Handle comment input change
  const handleCommentChange = useCallback((postId: string, value: string) => {
    setNewComments(prev => ({ ...prev, [postId]: value }));
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Community Hub...</p>
          <p className="text-slate-400 text-sm">Optimizing content for best experience</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Community Hub Error</h3>
            <p className="text-slate-300 mb-6">{error}</p>
            <Button onClick={loadCommunityData} icon={CheckCircle}>
              Retry Loading
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Community Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-bold text-white">Community Hub</h2>
              <div className="bg-green-500/20 px-2 py-1 rounded-full">
                <span className="text-green-300 text-xs font-bold">{posts.length} POSTS</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowAIChat(true)}
                icon={MessageCircle}
              >
                AI Help
              </Button>
              <Button 
                onClick={() => setShowCreatePost(true)}
                icon={Plus}
              >
                Share Content
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300">
            Share your racing achievements, screenshots, videos, and connect with fellow racers. 
            Show off your best lap times and racing moments!
          </p>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search posts, games, tracks, or tags..."
                onChange={(e) => debouncedSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Post Type Filter */}
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
                <option value="oldest">Oldest First</option>
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

              {/* Game Filter */}
              <select
                value={filters.game}
                onChange={(e) => setFilters(prev => ({ ...prev, game: e.target.value }))}
                className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Games</option>
                {availableGames.map(game => (
                  <option key={game} value={game}>{game}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Grid */}
      <div className="space-y-6">
        {filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Globe className="w-16 h-16 text-slate-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                {searchTerm || filters.type !== 'all' || filters.game ? 'No posts match your filters' : 'No community posts yet'}
              </h3>
              <p className="text-slate-400 mb-6">
                {searchTerm || filters.type !== 'all' || filters.game 
                  ? 'Try adjusting your search or filters to see more content.'
                  : 'Be the first to share your racing achievements with the community!'
                }
              </p>
              {(!searchTerm && filters.type === 'all' && !filters.game) && (
                <Button onClick={() => setShowCreatePost(true)} icon={Plus}>
                  Create First Post
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map((post) => {
            const postUser = getUserForPost(post.userId);
            const isLiked = post.likedBy.includes(currentUser.email);
            const isShared = post.sharedBy.includes(currentUser.email);
            const commentsExpanded = expandedComments.has(post.id);

            return (
              <Card key={post.id} className="hover:bg-slate-800/60 transition-all duration-200">
                <CardContent className="p-6">
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-700 border-2 border-slate-600">
                        {postUser.profilePicture ? (
                          <img 
                            src={postUser.profilePicture} 
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
                          <h3 className="font-semibold text-white">{postUser.fullName}</h3>
                          {postUser.vipMembership?.active && (
                            <div className="bg-red-500/20 px-2 py-1 rounded-full border border-red-500/30">
                              <span className="text-red-300 text-xs font-bold flex items-center">
                                <Crown className="w-3 h-3 mr-1" />
                                VIP
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>{formatTimeAgo(post.createdAt)}</span>
                          <div className="flex items-center space-x-1">
                            {post.type === 'screenshot' && <Camera className="w-3 h-3" />}
                            {post.type === 'video' && <Play className="w-3 h-3" />}
                            {post.type === 'lap_record' && <Trophy className="w-3 h-3" />}
                            {post.type === 'highlight' && <Star className="w-3 h-3" />}
                            <span className="capitalize">{post.type.replace('_', ' ')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {post.userId === currentUser.email && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPost(post);
                              setShowEditPost(true);
                            }}
                            icon={Edit}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this post?')) {
                                deletePostWithAudit(post.id, currentUser.email, 'User deletion');
                                invalidateCache();
                                loadCommunityData();
                              }
                            }}
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
                        className="text-slate-400 hover:text-red-400"
                      >
                        Report
                      </Button>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white">{post.title}</h2>
                    
                    {post.description && (
                      <p className="text-slate-300 leading-relaxed">{post.description}</p>
                    )}

                    {/* Post Media */}
                    {post.mediaUrl && (
                      <div className="rounded-lg overflow-hidden">
                        {post.type === 'video' ? (
                          <div className="relative bg-slate-800 rounded-lg p-8 text-center">
                            <Play className="w-16 h-16 text-red-500 mx-auto mb-4" />
                            <p className="text-white font-semibold">Video Content</p>
                            <p className="text-slate-400 text-sm">Click to view video</p>
                          </div>
                        ) : (
                          <img 
                            src={post.mediaUrl} 
                            alt={post.title}
                            className="w-full max-h-96 object-cover rounded-lg"
                            loading="lazy"
                          />
                        )}
                      </div>
                    )}

                    {/* Racing Details */}
                    {(post.game || post.track || post.lapTime || post.achievement) && (
                      <div className="bg-slate-700/30 rounded-lg p-4 space-y-2">
                        {post.game && (
                          <div className="flex items-center space-x-2">
                            <Gamepad2 className="w-4 h-4 text-blue-400" />
                            <span className="text-slate-300 text-sm">Game: {post.game}</span>
                          </div>
                        )}
                        {post.track && (
                          <div className="flex items-center space-x-2">
                            <Target className="w-4 h-4 text-green-400" />
                            <span className="text-slate-300 text-sm">Track: {post.track}</span>
                          </div>
                        )}
                        {post.lapTime && (
                          <div className="flex items-center space-x-2">
                            <Timer className="w-4 h-4 text-yellow-400" />
                            <span className="text-slate-300 text-sm">Lap Time: {post.lapTime}</span>
                          </div>
                        )}
                        {post.achievement && (
                          <div className="flex items-center space-x-2">
                            <Award className="w-4 h-4 text-purple-400" />
                            <span className="text-slate-300 text-sm">Achievement: {post.achievement}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag, index) => (
                          <span 
                            key={index}
                            className="bg-slate-700/50 px-2 py-1 rounded text-xs text-slate-300 cursor-pointer hover:bg-slate-600/50 transition-colors"
                            onClick={() => debouncedSearch(tag)}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Engagement Bar */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                      <div className="flex items-center space-x-6">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLikePost(post.id)}
                          className={`flex items-center space-x-2 ${isLiked ? 'text-red-400' : 'text-slate-400 hover:text-red-400'}`}
                        >
                          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                          <span>{post.likes}</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleComments(post.id)}
                          className="flex items-center space-x-2 text-slate-400 hover:text-blue-400"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.comments?.length || 0}</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSharePost(post)}
                          className={`flex items-center space-x-2 ${isShared ? 'text-green-400' : 'text-slate-400 hover:text-green-400'}`}
                        >
                          <Share2 className="w-4 h-4" />
                          <span>{post.shares}</span>
                        </Button>
                      </div>

                      <div className="flex items-center space-x-2 text-xs text-slate-500">
                        <Eye className="w-3 h-3" />
                        <span>{Math.floor(Math.random() * 100) + 50} views</span>
                      </div>
                    </div>

                    {/* Comments Section */}
                    {commentsExpanded && (
                      <div className="space-y-4 pt-4 border-t border-slate-700">
                        {/* Existing Comments */}
                        {post.comments && post.comments.length > 0 && (
                          <div className="space-y-3">
                            {post.comments.map((comment) => {
                              const commentUser = getUserForPost(comment.userId);
                              return (
                                <div key={comment.id} className="flex space-x-3 p-3 bg-slate-700/20 rounded-lg">
                                  <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-600 flex-shrink-0">
                                    {commentUser.profilePicture ? (
                                      <img 
                                        src={commentUser.profilePicture} 
                                        alt="Profile" 
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <User className="w-4 h-4 text-slate-400" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span className="font-medium text-white text-sm">{commentUser.fullName}</span>
                                      {commentUser.vipMembership?.active && (
                                        <Crown className="w-3 h-3 text-red-400" />
                                      )}
                                      <span className="text-xs text-slate-500">
                                        {formatTimeAgo(comment.createdAt)}
                                      </span>
                                    </div>
                                    <p className="text-slate-300 text-sm">{comment.text}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Add Comment */}
                        <div className="flex space-x-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-600 flex-shrink-0">
                            {currentUser.profilePicture ? (
                              <img 
                                src={currentUser.profilePicture} 
                                alt="Your profile" 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <User className="w-4 h-4 text-slate-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 flex space-x-2">
                            <input
                              type="text"
                              placeholder="Add a comment..."
                              value={newComments[post.id] || ''}
                              onChange={(e) => handleCommentChange(post.id, e.target.value)}
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
                              disabled={!newComments[post.id]?.trim()}
                              icon={Send}
                            >
                              Post
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Create Post Modal */}
      <Modal
        isOpen={showCreatePost}
        onClose={() => {
          setShowCreatePost(false);
          setNewPostErrors([]);
        }}
        title="Share Your Racing Content"
      >
        <div className="space-y-6">
          {/* Post Type Selection */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { type: 'screenshot', icon: Camera, label: 'Screenshot', color: 'bg-blue-500/20 text-blue-400' },
              { type: 'video', icon: Play, label: 'Video', color: 'bg-purple-500/20 text-purple-400' },
              { type: 'lap_record', icon: Trophy, label: 'Lap Record', color: 'bg-yellow-500/20 text-yellow-400' },
              { type: 'highlight', icon: Star, label: 'Highlight', color: 'bg-green-500/20 text-green-400' }
            ].map(({ type, icon: Icon, label, color }) => (
              <button
                key={type}
                type="button"
                onClick={() => setNewPost(prev => ({ ...prev, type: type as any }))}
                className={`p-3 rounded-lg border-2 transition-all ${
                  newPost.type === type
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-slate-600 hover:border-slate-500'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2 ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-white text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>

          {/* Post Form */}
          <div className="space-y-4">
            <Input
              label="Title"
              placeholder="Share your racing moment..."
              value={newPost.title}
              onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
              maxLength={100}
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Description ({newPost.description.length}/500)
              </label>
              <textarea
                placeholder="Tell us about your racing experience..."
                value={newPost.description}
                onChange={(e) => setNewPost(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
            </div>

            {/* Media Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Media (Optional)
              </label>
              <ImageDropZone onImageSelect={handleImageUpload} />
            </div>

            {/* Racing Details */}
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

            {newPost.type === 'highlight' && (
              <Input
                label="Achievement"
                placeholder="e.g., First place finish, Personal best"
                value={newPost.achievement}
                onChange={(e) => setNewPost(prev => ({ ...prev, achievement: e.target.value }))}
              />
            )}

            {/* Tags */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Tags (Press Enter or comma to add)
              </label>
              <input
                type="text"
                placeholder="Add tags..."
                onKeyDown={handleTagInput}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              {newPost.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {newPost.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="bg-slate-700/50 px-2 py-1 rounded text-xs text-slate-300 flex items-center space-x-1 cursor-pointer hover:bg-red-500/20"
                      onClick={() => removeTag(tag)}
                    >
                      <span>#{tag}</span>
                      <Trash2 className="w-3 h-3" />
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Error Display */}
          {newPostErrors.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-red-400 mb-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold">Please fix the following issues:</span>
              </div>
              <ul className="text-red-300 text-sm space-y-1">
                {newPostErrors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button 
              onClick={handleCreatePost}
              disabled={isCreatingPost || !newPost.title.trim()}
              className="flex-1"
              icon={Plus}
            >
              {isCreatingPost ? 'Sharing...' : 'Share with Community'}
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setShowCreatePost(false);
                setNewPostErrors([]);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Post Modal */}
      {selectedPost && (
        <PostEditModal
          isOpen={showEditPost}
          onClose={() => {
            setShowEditPost(false);
            setSelectedPost(null);
          }}
          post={selectedPost}
          userEmail={currentUser.email}
          onPostUpdated={(updatedPost) => {
            invalidateCache();
            loadCommunityData();
          }}
        />
      )}

      {/* Share Modal */}
      {shareData && (
        <SocialShareModal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            setShareData(null);
          }}
          shareData={shareData}
          title="Share Racing Content"
        />
      )}

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
        <div className="space-y-6">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-red-400 mb-2">
              <Flag className="w-5 h-5" />
              <span className="font-semibold">Report Content</span>
            </div>
            <p className="text-red-300 text-sm">
              Help us maintain a positive community by reporting content that violates our guidelines.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Reason for Report</label>
              <select
                value={reportData.reason}
                onChange={(e) => setReportData(prev => ({ ...prev, reason: e.target.value as any }))}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="spam">Spam or unwanted content</option>
                <option value="inappropriate">Inappropriate content</option>
                <option value="harassment">Harassment or bullying</option>
                <option value="copyright">Copyright violation</option>
                <option value="other">Other violation</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                Additional Details
              </label>
              <textarea
                placeholder="Please provide more details about why you're reporting this content..."
                value={reportData.description}
                onChange={(e) => setReportData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
            </div>
          </div>

          <div className="flex space-x-3">
            <Button 
              onClick={handleReportPost}
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

      {/* AI Chat for Community Support */}
      <AIChat
        currentUser={currentUser}
        isOpen={showAIChat}
        onClose={() => setShowAIChat(false)}
        initialType="general"
      />
    </div>
  );
}